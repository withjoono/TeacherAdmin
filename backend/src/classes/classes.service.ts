import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class ClassesService {
    private readonly logger = new Logger(ClassesService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * 새 클래스(아레나) 생성
     */
    /**
     * 새 클래스(아레나) 생성
     */
    async createClass(teacherHubId: string, name: string, description?: string) {
        const arenaCode = `TA-${Date.now().toString(36).toUpperCase()}`;
        const inviteCode = this.generateInviteCode();

        const arena = await this.prisma.arena.create({
            data: {
                arenaCode,
                name,
                description: description || null,
                ownerId: teacherHubId,
                inviteCode,
            },
        });

        this.logger.log(`클래스 생성 완료: ${name} (ID: ${arena.id})`);

        return {
            id: Number(arena.id),
            arenaCode: arena.arenaCode,
            name: arena.name,
            description: arena.description,
            inviteCode: arena.inviteCode,
            createdAt: arena.createdAt,
        };
    }

    /**
     * 교사가 소유한 클래스 목록 조회
     */
    async getMyClasses(teacherHubId: string) {
        const arenas = await this.prisma.arena.findMany({
            where: { ownerId: teacherHubId, isActive: true },
            include: {
                _count: { select: { members: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return arenas.map((a) => ({
            id: Number(a.id),
            arenaCode: a.arenaCode,
            name: a.name,
            description: a.description,
            inviteCode: a.inviteCode,
            memberCount: a._count.members,
            createdAt: a.createdAt,
        }));
    }

    /**
     * 학생 일괄 등록 (ID 기반)
     * - auth_member 테이블에서 존재 여부 확인
     * - 존재하면 sa_arena_member에 등록
     * - 미존재 시 실패 목록에 추가 (가입 유도)
     */
    async importStudents(arenaId: number, studentIds: string[]) {
        const arena = await this.prisma.arena.findUnique({
            where: { id: BigInt(arenaId) },
        });

        if (!arena) {
            throw new NotFoundException('클래스를 찾을 수 없습니다.');
        }

        // auth_member 테이블에서 존재 여부 확인
        const foundMembers = await this.prisma.auth_member.findMany({
            where: { id: { in: studentIds } },
            select: { id: true, nickname: true, email: true },
        });

        const foundIds = new Set(foundMembers.map((m) => m.id));
        const notFoundIds = studentIds.filter((id) => !foundIds.has(id));

        // 이미 등록된 멤버 확인
        const existingMembers = await this.prisma.arenaMember.findMany({
            where: {
                arenaId: BigInt(arenaId),
                authMemberId: { in: [...foundIds] },
            },
            select: { authMemberId: true },
        });

        const alreadyRegistered = new Set(
            existingMembers.map((m) => m.authMemberId).filter(Boolean),
        );

        // 신규 등록 대상만 필터링
        const toRegister = foundMembers.filter(
            (m) => !alreadyRegistered.has(m.id),
        );

        // 일괄 등록
        const registered: string[] = [];
        for (const member of toRegister) {
            try {
                await this.prisma.arenaMember.create({
                    data: {
                        arenaId: BigInt(arenaId),
                        studentId: member.id,
                        hubMemberId: member.id,
                        authMemberId: member.id,
                        role: 'member',
                    },
                });
                registered.push(member.id);
            } catch (error) {
                this.logger.warn(`학생 등록 실패 (${member.id}): ${error}`);
            }
        }

        const skipped = [...alreadyRegistered];

        this.logger.log(
            `학생 임포트 결과 - 성공: ${registered.length}, 미가입: ${notFoundIds.length}, 이미등록: ${skipped.length}`,
        );

        return {
            registered: {
                count: registered.length,
                ids: registered,
            },
            alreadyRegistered: {
                count: skipped.length,
                ids: skipped,
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
     */
    async getClassStats(arenaId: number, period: 'daily' | 'weekly' | 'monthly' = 'weekly') {
        const arena = await this.prisma.arena.findUnique({
            where: { id: BigInt(arenaId) },
        });

        if (!arena) {
            throw new NotFoundException('클래스를 찾을 수 없습니다.');
        }

        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'daily':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7); // 최근 7일
                break;
            case 'weekly':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 28); // 최근 4주
                break;
            case 'monthly':
                startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - 3); // 최근 3개월
                break;
        }
        startDate.setHours(0, 0, 0, 0);

        // 멤버 목록 조회
        const members = await this.prisma.arenaMember.findMany({
            where: { arenaId: BigInt(arenaId), isActive: true },
            include: {
                authMember: true,
            },
        });

        // 스냅샷 조회
        const snapshots = await this.prisma.dailySnapshot.findMany({
            where: {
                arenaId: BigInt(arenaId),
                date: { gte: startDate },
            },
            orderBy: { date: 'asc' },
        });

        // 멤버별 학습량 집계
        const memberStats = members.map((member) => {
            const memberSnapshots = snapshots.filter(
                (s) => s.memberId === member.id,
            );
            const totalStudyMin = memberSnapshots.reduce(
                (sum, s) => sum + (s.totalStudyMin || 0),
                0,
            );
            const avgStudyMin =
                memberSnapshots.length > 0
                    ? Math.round(totalStudyMin / memberSnapshots.length)
                    : 0;

            return {
                memberId: Number(member.id),
                authMemberId: member.authMemberId,
                totalStudyMin,
                avgStudyMin,
                activeDays: memberSnapshots.filter((s) => s.totalStudyMin > 0).length,
            };
        });

        // 날짜별 전체 학습량 집계 (차트 데이터)
        const dateMap = new Map<string, { date: string; totalStudyMin: number; memberCount: number }>();
        for (const snap of snapshots) {
            const dateKey = snap.date.toISOString().split('T')[0];
            const existing = dateMap.get(dateKey);
            if (existing) {
                existing.totalStudyMin += snap.totalStudyMin || 0;
                existing.memberCount += snap.totalStudyMin > 0 ? 1 : 0;
            } else {
                dateMap.set(dateKey, {
                    date: dateKey,
                    totalStudyMin: snap.totalStudyMin || 0,
                    memberCount: snap.totalStudyMin > 0 ? 1 : 0,
                });
            }
        }

        const chartData = Array.from(dateMap.values()).sort(
            (a, b) => a.date.localeCompare(b.date),
        );

        // 반 평균
        const totalStudyAll = memberStats.reduce((sum, m) => sum + m.totalStudyMin, 0);
        const activeMembers = memberStats.filter((m) => m.totalStudyMin > 0);

        return {
            arenaId,
            arenaName: arena.name,
            period,
            summary: {
                totalMembers: members.length,
                activeMembers: activeMembers.length,
                totalStudyMin: totalStudyAll,
                avgStudyMinPerMember:
                    activeMembers.length > 0
                        ? Math.round(totalStudyAll / activeMembers.length)
                        : 0,
            },
            chartData,
            memberStats: memberStats.sort((a, b) => b.totalStudyMin - a.totalStudyMin),
        };
    }

    /**
     * 클래스 멤버 목록 조회
     */
    async getClassMembers(arenaId: number) {
        const members = await this.prisma.arenaMember.findMany({
            where: { arenaId: BigInt(arenaId), isActive: true },
            orderBy: { joinedAt: 'desc' },
        });

        // auth_member에서 닉네임/이메일 조회
        const authMemberIds = members
            .map((m) => m.authMemberId)
            .filter(Boolean) as string[];

        const authMembers = await this.prisma.auth_member.findMany({
            where: { id: { in: authMemberIds } },
            select: { id: true, nickname: true, email: true },
        });

        const authMap = new Map(authMembers.map((a) => [a.id, a]));

        return members.map((m) => {
            const auth = m.authMemberId ? authMap.get(m.authMemberId) : null;
            return {
                memberId: Number(m.id),
                authMemberId: m.authMemberId,
                nickname: auth?.nickname || '(이름 없음)',
                email: auth?.email || '',
                role: m.role,
                joinedAt: m.joinedAt,
                isActive: m.isActive,
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
