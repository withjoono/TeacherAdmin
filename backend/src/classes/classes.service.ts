import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class ClassesService {
    private readonly logger = new Logger(ClassesService.name);

    constructor(private readonly prisma: PrismaService) { }

    // ==================== Hub Mentoring 기반 반 관리 ====================

    /**
     * 새 클래스(반) 생성 → Hub mentoring_class_tb에 저장
     */
    async createClass(teacherHubId: string, name: string, description?: string) {
        const inviteCode = this.generateInviteCode();

        const cls = await this.prisma.mentoring_class_tb.create({
            data: {
                teacher_id: teacherHubId,
                name,
                description: description || null,
                invite_code: inviteCode,
            },
        });

        this.logger.log(`클래스 생성 완료 (Hub): ${name} (ID: ${cls.id})`);

        return {
            id: cls.id,
            name: cls.name,
            description: cls.description,
            inviteCode: cls.invite_code,
            subject: cls.subject,
            createdAt: cls.created_at,
        };
    }

    /**
     * 교사가 소유한 클래스 목록 조회 → Hub mentoring_class_tb
     */
    async getMyClasses(teacherHubId: string) {
        const classes = await this.prisma.mentoring_class_tb.findMany({
            where: { teacher_id: teacherHubId, is_active: true },
            orderBy: { created_at: 'desc' },
        });

        // 각 반의 멤버 수 조회 (mentoring_account_link_tb에서 class_id로 카운트)
        const result = await Promise.all(
            classes.map(async (cls) => {
                const memberCount = await this.prisma.mentoring_account_link_tb.count({
                    where: { class_id: cls.id },
                });
                return {
                    id: cls.id,
                    name: cls.name,
                    description: cls.description,
                    inviteCode: cls.invite_code,
                    subject: cls.subject,
                    memberCount,
                    createdAt: cls.created_at,
                };
            }),
        );

        return result;
    }

    /**
     * 학생 일괄 등록 (ID 기반)
     * - auth_member에서 존재 여부 확인
     * - mentoring_account_link_tb에 연동 + 반 배정
     */
    async importStudents(classId: number, teacherHubId: string, studentIds: string[]) {
        const cls = await this.prisma.mentoring_class_tb.findFirst({
            where: { id: classId, teacher_id: teacherHubId },
        });

        if (!cls) {
            throw new NotFoundException('클래스를 찾을 수 없습니다.');
        }

        // auth_member 테이블에서 존재 여부 확인
        const foundMembers = await this.prisma.auth_member.findMany({
            where: { id: { in: studentIds } },
            select: { id: true, nickname: true, email: true },
        });

        const foundIds = new Set(foundMembers.map((m) => m.id));
        const notFoundIds = studentIds.filter((id) => !foundIds.has(id));

        // 이미 해당 반에 배정된 멤버 확인
        const existingLinks = await this.prisma.mentoring_account_link_tb.findMany({
            where: {
                class_id: classId,
                OR: [
                    { member_id: teacherHubId, linked_member_id: { in: [...foundIds] } },
                    { member_id: { in: [...foundIds] }, linked_member_id: teacherHubId },
                ],
            },
        });

        const alreadyLinkedIds = new Set<string>();
        for (const link of existingLinks) {
            if (link.member_id === teacherHubId) {
                alreadyLinkedIds.add(link.linked_member_id);
            } else {
                alreadyLinkedIds.add(link.member_id);
            }
        }

        // 신규 등록 대상만 필터링
        const toRegister = foundMembers.filter((m) => !alreadyLinkedIds.has(m.id));

        // 일괄 등록 (연동 + 반 배정)
        const registered: string[] = [];
        for (const member of toRegister) {
            try {
                // 기존 연동이 있는지 확인 (class_id가 null인 경우)
                const existingLink = await this.prisma.mentoring_account_link_tb.findFirst({
                    where: {
                        OR: [
                            { member_id: teacherHubId, linked_member_id: member.id },
                            { member_id: member.id, linked_member_id: teacherHubId },
                        ],
                    },
                });

                if (existingLink) {
                    // 기존 연동의 반 배정만 업데이트
                    await this.prisma.mentoring_account_link_tb.update({
                        where: { id: existingLink.id },
                        data: { class_id: classId, class_name: cls.name },
                    });
                } else {
                    // 새 연동 + 반 배정
                    await this.prisma.mentoring_account_link_tb.create({
                        data: {
                            member_id: teacherHubId,
                            linked_member_id: member.id,
                            class_id: classId,
                            class_name: cls.name,
                        },
                    });
                }
                registered.push(member.id);
            } catch (error) {
                this.logger.warn(`학생 등록 실패 (${member.id}): ${error}`);
            }
        }

        this.logger.log(
            `학생 임포트 결과 - 성공: ${registered.length}, 미가입: ${notFoundIds.length}, 이미등록: ${alreadyLinkedIds.size}`,
        );

        return {
            registered: {
                count: registered.length,
                ids: registered,
            },
            alreadyRegistered: {
                count: alreadyLinkedIds.size,
                ids: [...alreadyLinkedIds],
            },
            notFound: {
                count: notFoundIds.length,
                ids: notFoundIds,
                message:
                    notFoundIds.length > 0
                        ? '다음 학생들은 아직 가입하지 않았습니다. 회원가입을 안내해주세요.'
                        : null,
            },
        };
    }

    /**
     * 클래스 학습량 통계 (일간/주간/월간)
     * DailySnapshot은 기존 sa_arena 기반 — 향후 Hub class_id로 마이그레이션
     */
    async getClassStats(classId: number, teacherHubId: string, period: 'daily' | 'weekly' | 'monthly' = 'weekly') {
        const cls = await this.prisma.mentoring_class_tb.findFirst({
            where: { id: classId, teacher_id: teacherHubId },
        });

        if (!cls) {
            throw new NotFoundException('클래스를 찾을 수 없습니다.');
        }

        // Hub 반에 배정된 학생 목록
        const links = await this.prisma.mentoring_account_link_tb.findMany({
            where: { class_id: classId },
        });

        const studentIds = links.map((l) =>
            l.member_id === teacherHubId ? l.linked_member_id : l.member_id,
        );

        // 학생별 정보 조회
        const students = await this.prisma.auth_member.findMany({
            where: { id: { in: studentIds } },
            select: { id: true, nickname: true, email: true },
        });

        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'daily':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'weekly':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 28);
                break;
            case 'monthly':
                startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - 3);
                break;
        }
        startDate.setHours(0, 0, 0, 0);

        return {
            classId,
            className: cls.name,
            period,
            summary: {
                totalMembers: students.length,
                activeMembers: 0,
                totalStudyMin: 0,
                avgStudyMinPerMember: 0,
            },
            chartData: [],
            memberStats: students.map((s) => ({
                studentId: s.id,
                studentName: s.nickname || '사용자',
                email: s.email,
                totalStudyMin: 0,
                avgStudyMin: 0,
                activeDays: 0,
            })),
        };
    }

    /**
     * 클래스 멤버 목록 조회 → Hub mentoring_account_link_tb
     */
    async getClassMembers(classId: number, teacherHubId: string) {
        const cls = await this.prisma.mentoring_class_tb.findFirst({
            where: { id: classId, teacher_id: teacherHubId },
        });

        if (!cls) {
            throw new NotFoundException('클래스를 찾을 수 없습니다.');
        }

        const links = await this.prisma.mentoring_account_link_tb.findMany({
            where: { class_id: classId },
            orderBy: { created_at: 'desc' },
        });

        // 연동된 학생 ID 추출
        const studentIds = links.map((l) =>
            l.member_id === teacherHubId ? l.linked_member_id : l.member_id,
        );

        // auth_member에서 닉네임/이메일 조회
        const authMembers = await this.prisma.auth_member.findMany({
            where: { id: { in: studentIds } },
            select: { id: true, nickname: true, email: true, member_type: true },
        });

        const authMap = new Map(authMembers.map((a) => [a.id, a]));

        return links.map((link) => {
            const studentId = link.member_id === teacherHubId
                ? link.linked_member_id
                : link.member_id;
            const auth = authMap.get(studentId);
            return {
                linkId: link.id,
                studentId,
                nickname: auth?.nickname || '(이름 없음)',
                email: auth?.email || '',
                role: auth?.member_type || 'student',
                joinedAt: link.created_at,
            };
        });
    }

    private generateInviteCode(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
}
