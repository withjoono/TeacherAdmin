import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 플래너 검사·채점 서비스
 *
 * StudyPlanner(public 스키마)의 플래너를 조회하고, 선생님이 1~10점 성취도
 * 점수와 코멘트를 부여한다. 채점 결과는 StudyPlanner와 동일한
 * sp_planner_rating 테이블에 기록되어, 학생 앱의 「담당 선생님 반」
 * 경쟁 화면(Phase 1)에 그대로 반영된다.
 *
 * 식별자 정합성:
 * - TeacherAdmin 은 학생/선생님을 Hub member_id 로 식별한다.
 * - StudyPlanner 의 Student.userId 는 'sp_' 접두사가 붙은 Hub member_id 다.
 * - resolveStudent() 가 Hub member_id → StudyPlanner Student 레코드를 매핑한다
 *   (StudyPlanner mission.service.getOrCreateStudent / teacher-group.service
 *    .findStudent 의 조회 정책과 동일).
 */
@Injectable()
export class PlannerService {
  private readonly logger = new Logger(PlannerService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ================================================================
  // Public API
  // ================================================================

  /** 학생의 특정 날짜 플래너(미션) + 최근 7일 점수 조회 */
  async getStudentPlanner(teacherHubId: string, studentHubId: string, date?: string) {
    await this.verifyStudentAccess(teacherHubId, studentHubId);
    const student = await this.requireStudent(studentHubId);

    const dateStr = this.normalizeDateStr(date);
    const day = new Date(dateStr);

    const missions = await this.prisma.spDailyMission.findMany({
      where: { studentId: student.id, date: day },
      orderBy: [{ sortOrder: 'asc' }, { startTime: 'asc' }],
    });

    // 미션별 최신 결과 매핑
    const missionIds = missions.map((m) => m.id);
    const results =
      missionIds.length > 0
        ? await this.prisma.spMissionResult.findMany({
            where: { missionId: { in: missionIds } },
            orderBy: { createdAt: 'desc' },
          })
        : [];
    const latestResult = new Map<string, (typeof results)[number]>();
    for (const r of results) {
      const key = r.missionId.toString();
      if (!latestResult.has(key)) latestResult.set(key, r);
    }

    const missionDtos = missions.map((m) => {
      const r = latestResult.get(m.id.toString());
      return {
        id: Number(m.id),
        subject: m.subject,
        content: m.content,
        startTime: this.fmtTime(m.startTime),
        endTime: this.fmtTime(m.endTime),
        plannedStartPage: m.startPage,
        plannedEndPage: m.endPage,
        plannedAmount: m.amount,
        status: m.status,
        completed: m.status === 'completed',
        actualStartPage: r?.startPage ?? null,
        actualEndPage: r?.endPage ?? null,
        actualAmount: r?.amount ?? null,
        studyMinutes: r?.studyMinutes ?? null,
      };
    });

    const summary = {
      totalMissions: missionDtos.length,
      completedMissions: missionDtos.filter((m) => m.completed).length,
      studyMinutes: missionDtos.reduce((s, m) => s + (m.studyMinutes ?? 0), 0),
      totalPages: missionDtos.reduce((s, m) => s + (m.actualAmount ?? 0), 0),
    };

    // 최근 7일 일일 점수
    const weekAgo = new Date(day);
    weekAgo.setDate(weekAgo.getDate() - 6);
    const scores = await this.prisma.spDailyScore.findMany({
      where: { studentId: student.id, date: { gte: weekAgo, lte: day } },
      orderBy: { date: 'asc' },
    });

    return {
      date: dateStr,
      student: {
        id: Number(student.id),
        name: student.name,
        grade: student.grade,
        schoolName: student.schoolName,
      },
      missions: missionDtos,
      summary,
      recentScores: scores.map((s) => ({
        date: this.fmtDate(s.date),
        totalScore: Number(s.totalScore),
        missionCount: s.missionCount,
        studyMinutes: s.studyMinutes,
      })),
    };
  }

  /** 학생의 선생님 채점 이력 조회 */
  async getStudentRatings(teacherHubId: string, studentHubId: string) {
    await this.verifyStudentAccess(teacherHubId, studentHubId);
    const student = await this.requireStudent(studentHubId);

    const link = await this.prisma.spTeacherStudent.findUnique({
      where: {
        uk_teacher_student: { teacherId: teacherHubId, studentId: student.id },
      },
    });
    if (!link) return [];

    const ratings = await this.prisma.spPlannerRating.findMany({
      where: { teacherStudentId: link.id },
      orderBy: { ratingDate: 'desc' },
    });

    return ratings.map((r) => ({
      id: Number(r.id),
      date: this.fmtDate(r.ratingDate),
      score: r.score,
      comment: r.comment,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  /** 1~10점 성취도 점수 + 코멘트 채점 (날짜별 1건, 있으면 갱신) */
  async rateStudent(
    teacherHubId: string,
    studentHubId: string,
    body: { date: string; score: number; comment?: string },
  ) {
    await this.verifyStudentAccess(teacherHubId, studentHubId);
    const student = await this.requireStudent(studentHubId);

    if (body?.date == null || body?.score == null) {
      throw new BadRequestException('채점 날짜와 점수는 필수입니다.');
    }
    const score = Math.min(10, Math.max(1, Math.round(Number(body.score))));
    if (Number.isNaN(score)) {
      throw new BadRequestException('점수는 1~10 사이의 숫자여야 합니다.');
    }
    const ratingDate = new Date(this.normalizeDateStr(body.date));

    // 선생님-학생 연결(get-or-create) → 채점은 이 연결을 통해 기록된다.
    const link = await this.prisma.spTeacherStudent.upsert({
      where: {
        uk_teacher_student: { teacherId: teacherHubId, studentId: student.id },
      },
      create: { teacherId: teacherHubId, studentId: student.id },
      update: {},
    });

    const rating = await this.prisma.spPlannerRating.upsert({
      where: {
        uk_rating_date: { teacherStudentId: link.id, ratingDate },
      },
      create: {
        teacherStudentId: link.id,
        ratingDate,
        score,
        comment: body.comment ?? null,
      },
      update: { score, comment: body.comment ?? null },
    });

    return {
      id: Number(rating.id),
      date: this.fmtDate(rating.ratingDate),
      score: rating.score,
      comment: rating.comment,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
    };
  }

  // ================================================================
  // Helpers
  // ================================================================

  /**
   * Hub member_id 기반 선생님↔학생 접근 권한 검증.
   * TeacherAdmin 의 tutor.service.verifyStudentAccess 와 동일한 정책
   * (Hub mentoring_account_link_tb 의 양방향 연결을 확인).
   */
  private async verifyStudentAccess(teacherHubId: string, studentHubId: string) {
    if (!teacherHubId) throw new ForbiddenException('인증 정보를 확인할 수 없습니다.');
    const links = await this.prisma.mentoring_account_link_tb.findMany({
      where: {
        OR: [
          { member_id: teacherHubId, linked_member_id: studentHubId },
          { member_id: studentHubId, linked_member_id: teacherHubId },
        ],
      },
    });
    if (links.length === 0) {
      throw new ForbiddenException('이 학생에 대한 접근 권한이 없습니다.');
    }
  }

  /**
   * Hub member_id → StudyPlanner Student 매핑.
   * StudyPlanner 의 학생 조회 정책과 동일하게 3단계로 시도한다.
   */
  private async resolveStudent(studentHubId: string) {
    if (/^\d+$/.test(studentHubId)) {
      const byId = await this.prisma.spStudent.findUnique({
        where: { id: BigInt(studentHubId) },
      });
      if (byId) return byId;
    }
    const byUserId = await this.prisma.spStudent.findFirst({
      where: { userId: studentHubId },
    });
    if (byUserId) return byUserId;
    if (!studentHubId.startsWith('sp_')) {
      const withPrefix = await this.prisma.spStudent.findFirst({
        where: { userId: `sp_${studentHubId}` },
      });
      if (withPrefix) return withPrefix;
    }
    return null;
  }

  private async requireStudent(studentHubId: string) {
    const student = await this.resolveStudent(studentHubId);
    if (!student) {
      throw new NotFoundException(
        '이 학생의 StudyPlanner 플래너를 찾을 수 없습니다. 학생이 StudyPlanner에 가입한 뒤 다시 시도해주세요.',
      );
    }
    return student;
  }

  /** 'YYYY-MM-DD' 정규화 (미입력 시 오늘) */
  private normalizeDateStr(date?: string): string {
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    return new Date().toISOString().slice(0, 10);
  }

  /** @db.Date → 'YYYY-MM-DD' */
  private fmtDate(d: Date | null): string {
    if (!d) return '';
    return new Date(d).toISOString().slice(0, 10);
  }

  /** @db.Time → 'HH:mm' */
  private fmtTime(d: Date | null): string | null {
    if (!d) return null;
    return new Date(d).toISOString().slice(11, 16);
  }
}
