import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { HubGroupsClient } from './hub-groups-client';

@Injectable()
export class ClassesService {
    private readonly logger = new Logger(ClassesService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly hubClient: HubGroupsClient,
    ) {}

    /**
     * 새 클래스(반) 생성 → Hub internal API (hub_group_teacher)
     */
    async createClass(teacherHubId: string, name: string, description?: string) {
        const result = await this.hubClient.createTeacherGroup({ teacherHubId, name, description });
        this.logger.log(`클래스 생성 완료 (Hub): ${name} (ID: ${result.id})`);
        return result;
    }

    /**
     * 교사가 소유한 클래스 목록 조회 → Prisma (hub_group_teacher)
     */
    async getMyClasses(teacherHubId: string) {
        const groups = await this.prisma.hubGroupTeacher.findMany({
            where: { teacherHubId, isActive: true },
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { members: true } } },
        });

        return groups.map((g) => ({
            id: g.id.toString(),
            name: g.name,
            description: g.description,
            inviteCode: g.inviteCode,
            subject: g.subject,
            memberCount: g._count.members,
            createdAt: g.createdAt,
        }));
    }

    /**
     * 학생 일괄 등록 → Hub internal API
     * 소유권 확인만 Prisma로, 등록 로직은 Hub에 위임
     */
    async importStudents(classId: number, teacherHubId: string, studentIds: string[]) {
        const gid = BigInt(classId);
        const group = await this.prisma.hubGroupTeacher.findFirst({
            where: { id: gid, teacherHubId },
        });
        if (!group) {
            throw new NotFoundException('클래스를 찾을 수 없습니다.');
        }

        return this.hubClient.addStudents(gid.toString(), teacherHubId, studentIds);
    }

    /**
     * 클래스 학습량 통계 → Prisma (hub_group_teacher_member + auth_member)
     */
    async getClassStats(
        classId: number,
        teacherHubId: string,
        period: 'daily' | 'weekly' | 'monthly' = 'weekly',
    ) {
        const gid = BigInt(classId);
        const group = await this.prisma.hubGroupTeacher.findFirst({
            where: { id: gid, teacherHubId },
        });
        if (!group) {
            throw new NotFoundException('클래스를 찾을 수 없습니다.');
        }

        const members = await this.prisma.hubGroupTeacherMember.findMany({
            where: { groupId: gid },
        });

        // 선생님 본인은 제외하고 학생 목록 구성
        const studentIds = members
            .map((m) => m.hubUserId)
            .filter((id) => id !== teacherHubId);

        const authMembers = await this.prisma.auth_member.findMany({
            where: { id: { in: studentIds } },
            select: { id: true, nickname: true, email: true },
        });

        return {
            classId,
            className: group.name,
            period,
            summary: {
                totalMembers: authMembers.length,
                activeMembers: 0,
                totalStudyMin: 0,
                avgStudyMinPerMember: 0,
            },
            chartData: [],
            memberStats: authMembers.map((s) => ({
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
     * 클래스 멤버 목록 조회 → Prisma (hub_group_teacher_member + auth_member)
     */
    async getClassMembers(classId: number, teacherHubId: string) {
        const gid = BigInt(classId);
        const group = await this.prisma.hubGroupTeacher.findFirst({
            where: { id: gid, teacherHubId },
        });
        if (!group) {
            throw new NotFoundException('클래스를 찾을 수 없습니다.');
        }

        const members = await this.prisma.hubGroupTeacherMember.findMany({
            where: { groupId: gid },
            orderBy: { joinedAt: 'desc' },
        });

        // 선생님 본인 행 제외
        const studentMembers = members.filter((m) => m.hubUserId !== teacherHubId);
        const studentIds = studentMembers.map((m) => m.hubUserId);

        const authMembers = await this.prisma.auth_member.findMany({
            where: { id: { in: studentIds } },
            select: { id: true, nickname: true, email: true, member_type: true },
        });

        const authMap = new Map(authMembers.map((a) => [a.id, a]));

        return studentMembers.map((m) => {
            const auth = authMap.get(m.hubUserId);
            return {
                studentId: m.hubUserId,
                nickname: auth?.nickname || '(이름 없음)',
                email: auth?.email || '',
                role: auth?.member_type || 'student',
                joinedAt: m.joinedAt,
            };
        });
    }
}
