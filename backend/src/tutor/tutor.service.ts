import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SharedScheduleService } from './shared-schedule.service';

@Injectable()
export class TutorService {
    private readonly logger = new Logger(TutorService.name);

    constructor(
        private prisma: PrismaService,
        private sharedSchedule: SharedScheduleService,
    ) { }

    // ===== CLASS MANAGEMENT =====

    async getTeacherDashboard(teacherHubId: string) {
        const [classes, recentComments, studentLinks] = await Promise.all([
            this.prisma.mentoring_class_tb.findMany({
                where: { teacher_id: teacherHubId, is_active: true },
                include: { _count: { select: { lessonPlans: true } } },
                orderBy: { created_at: 'desc' },
            }).catch((e) => {
                this.logger.error(`Dashboard 클래스 조회 실패: ${e.message}`);
                return [];
            }),
            this.prisma.tbPrivateComment.findMany({
                where: { OR: [{ authorId: teacherHubId }, { targetId: teacherHubId }] },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: { id: true, content: true, createdAt: true, authorId: true },
            }).catch((e) => {
                this.logger.error(`Dashboard 코멘트 조회 실패: ${e.message}`);
                return [];
            }),
            this.prisma.mentoring_account_link_tb.findMany({
                where: { member_id: teacherHubId },
            }).catch(() => []),
        ]);

        const classIds = classes.map((c) => c.id);
        const uniqueStudentIds = new Set(
            studentLinks.map((l) => l.linked_member_id).filter(Boolean),
        );

        const [pendingAssignments, upcomingExams, todayLessons, nextLessonRaw] = await Promise.all([
            this.prisma.tbAssignment.count({
                where: { lesson: { classId: { in: classIds } } },
            }).catch(() => 0),
            this.prisma.tbTest.count({
                where: {
                    lesson: { classId: { in: classIds } },
                    testDate: { gte: new Date() },
                },
            }).catch(() => 0),
            this.prisma.tbLessonPlan.findMany({
                where: {
                    classId: { in: classIds },
                    scheduledDate: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lt: new Date(new Date().setHours(23, 59, 59, 999)),
                    },
                },
                include: { class: { select: { name: true, subject: true } } },
                orderBy: [{ startTime: 'asc' }, { scheduledDate: 'asc' }],
                take: 5,
            }).catch(() => []),
            this.prisma.tbLessonPlan.findFirst({
                where: {
                    classId: { in: classIds },
                    scheduledDate: { gt: new Date(new Date().setHours(23, 59, 59, 999)) },
                },
                include: { class: { select: { name: true, subject: true } } },
                orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
            }).catch(() => null),
        ]);

        // 답장 대기 학생 — 학생→교사 방향의 최근 코멘트에서 unique 학생 top 3
        const incoming = recentComments.filter(
            (c) => (c as any).authorId && (c as any).authorId !== teacherHubId,
        );
        const seenAuthors = new Set<string>();
        const pendingTop: { authorId: string; content: string; createdAt: Date }[] = [];
        for (const c of incoming) {
            const a = (c as any).authorId as string;
            if (seenAuthors.has(a)) continue;
            seenAuthors.add(a);
            pendingTop.push({ authorId: a, content: c.content, createdAt: c.createdAt });
            if (pendingTop.length >= 3) break;
        }
        const authorIds = pendingTop.map((p) => p.authorId);
        const authors = authorIds.length
            ? await this.prisma.auth_member
                .findMany({ where: { id: { in: authorIds } }, select: { id: true, nickname: true } })
                .catch(() => [] as { id: string; nickname: string | null }[])
            : [];
        const nameById = new Map(authors.map((a) => [a.id, a.nickname]));

        return {
            totalClasses: classes.length,
            totalStudents: uniqueStudentIds.size,
            pendingAssignments,
            upcomingExams,
            unreadMessages: recentComments.length,
            todayLessons: todayLessons.map((l) => {
                const lp = l as any;
                return {
                    id: l.id,
                    title: l.title,
                    className: lp.class?.name ?? null,
                    classSubject: lp.class?.subject ?? null,
                    subject: l.subject ?? null,
                    textbook: l.textbook ?? null,
                    dayOfWeek: l.dayOfWeek ?? null,
                    startTime: l.startTime ?? null,
                    endTime: l.endTime ?? null,
                    totalSessions: l.totalSessions ?? null,
                    scheduledDate: l.scheduledDate,
                };
            }),
            recentActivities: recentComments.map((c) => ({
                id: c.id,
                description: c.content.substring(0, 50),
                time: c.createdAt,
            })),
            nextLesson: nextLessonRaw
                ? {
                    id: (nextLessonRaw as any).id,
                    title: (nextLessonRaw as any).title,
                    className: (nextLessonRaw as any).class?.name ?? null,
                    classSubject: (nextLessonRaw as any).class?.subject ?? null,
                    subject: (nextLessonRaw as any).subject ?? null,
                    textbook: (nextLessonRaw as any).textbook ?? null,
                    startTime: (nextLessonRaw as any).startTime ?? null,
                    endTime: (nextLessonRaw as any).endTime ?? null,
                    scheduledDate: (nextLessonRaw as any).scheduledDate,
                }
                : null,
            pendingCommentStudents: pendingTop.map((p) => ({
                studentId: p.authorId,
                studentName: nameById.get(p.authorId) ?? '학생',
                content: p.content.substring(0, 60),
                createdAt: p.createdAt,
            })),
        };
    }

    /** 이번 주(월~일) 수업·과제·시험 일정 카운트 */
    async getWeekSchedule(teacherHubId: string) {
        // 이번 주 월요일 00:00 ~ 다음 주 월요일 00:00 (서버 로컬 기준)
        const now = new Date();
        const day = now.getDay(); // 0=Sun, 1=Mon
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + mondayOffset);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const days: { date: string; lessons: number; assignments: number; tests: number }[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            days.push({
                date: d.toISOString().slice(0, 10),
                lessons: 0,
                assignments: 0,
                tests: 0,
            });
        }

        const classes = await this.prisma.mentoring_class_tb
            .findMany({
                where: { teacher_id: teacherHubId, is_active: true },
                select: { id: true },
            })
            .catch(() => [] as { id: number }[]);
        const classIds = classes.map((c) => c.id);
        if (classIds.length === 0) {
            return {
                weekStart: days[0].date,
                weekEnd: days[6].date,
                days,
            };
        }

        const [lessons, assignments, tests] = await Promise.all([
            this.prisma.tbLessonPlan
                .findMany({
                    where: {
                        classId: { in: classIds },
                        scheduledDate: { gte: weekStart, lt: weekEnd },
                    },
                    select: { scheduledDate: true },
                })
                .catch(() => [] as { scheduledDate: Date | null }[]),
            this.prisma.tbAssignment
                .findMany({
                    where: {
                        lesson: { classId: { in: classIds } },
                        dueDate: { gte: weekStart, lt: weekEnd },
                    },
                    select: { dueDate: true },
                })
                .catch(() => [] as { dueDate: Date | null }[]),
            this.prisma.tbTest
                .findMany({
                    where: {
                        lesson: { classId: { in: classIds } },
                        testDate: { gte: weekStart, lt: weekEnd },
                    },
                    select: { testDate: true },
                })
                .catch(() => [] as { testDate: Date | null }[]),
        ]);

        const dayKey = (d: Date | null | undefined) =>
            d ? new Date(d).toISOString().slice(0, 10) : null;
        const bump = (k: string | null, field: 'lessons' | 'assignments' | 'tests') => {
            if (!k) return;
            const slot = days.find((x) => x.date === k);
            if (slot) slot[field] += 1;
        };
        for (const l of lessons) bump(dayKey(l.scheduledDate), 'lessons');
        for (const a of assignments) bump(dayKey(a.dueDate), 'assignments');
        for (const t of tests) bump(dayKey(t.testDate), 'tests');

        return {
            weekStart: days[0].date,
            weekEnd: days[6].date,
            days,
        };
    }

    async getMyClasses(teacherHubId: string) {
        const classes = await this.prisma.mentoring_class_tb.findMany({
            where: { teacher_id: teacherHubId, is_active: true },
            orderBy: { created_at: 'desc' },
        });
        if (classes.length === 0) return [];

        const classIds = classes.map((c) => c.id);

        // 이번 주 월~일
        const now = new Date();
        const day = now.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + mondayOffset);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const [links, weekLessons] = await Promise.all([
            this.prisma.mentoring_account_link_tb
                .findMany({
                    where: { class_id: { in: classIds } },
                    select: { class_id: true, member_id: true, linked_member_id: true },
                })
                .catch(() => [] as { class_id: number | null; member_id: string | null; linked_member_id: string | null }[]),
            this.prisma.tbLessonPlan
                .groupBy({
                    by: ['classId'],
                    where: {
                        classId: { in: classIds },
                        scheduledDate: { gte: weekStart, lt: weekEnd },
                    },
                    _count: { id: true },
                })
                .catch(() => [] as { classId: number; _count: { id: number } }[]),
        ]);

        const studentSetByClass = new Map<number, Set<string>>();
        for (const l of links) {
            if (l.class_id == null) continue;
            const sid = l.member_id === teacherHubId ? l.linked_member_id : l.member_id;
            if (!sid) continue;
            if (!studentSetByClass.has(l.class_id)) studentSetByClass.set(l.class_id, new Set());
            studentSetByClass.get(l.class_id)!.add(sid);
        }
        const weekCountByClass = new Map<number, number>(
            (weekLessons as any[]).map((w) => [w.classId, w._count?.id ?? 0]),
        );

        return classes.map((c) => ({
            ...c,
            studentCount: studentSetByClass.get(c.id)?.size ?? 0,
            weeklyLessonCount: weekCountByClass.get(c.id) ?? 0,
        }));
    }

    async getClassStudents(teacherHubId: string, classIdStr: string) {
        const classId = parseInt(classIdStr, 10);
        await this.verifyClassOwnership(teacherHubId, classId);

        const links = await this.prisma.mentoring_account_link_tb.findMany({
            where: { class_id: classId },
        });

        const studentIds = links.map(l => l.member_id === teacherHubId ? l.linked_member_id : l.member_id);

        const authMembers = await this.prisma.auth_member.findMany({
            where: { id: { in: studentIds } },
            select: { id: true, nickname: true, email: true, phone: true }
        });

        return authMembers.map(student => ({
            student: { ...student, username: student.nickname, avatarUrl: null },
            parent: null
        }));
    }

    // ===== LESSON PLANS =====

    async getLessonPlans(teacherHubId: string, classIdStr: string) {
        const classId = parseInt(classIdStr, 10);
        await this.verifyClassOwnership(teacherHubId, classId);

        return this.prisma.tbLessonPlan.findMany({
            where: { classId },
            include: {
                records: { orderBy: { recordDate: 'desc' } },
                assignments: {
                    include: {
                        submissions: {
                            include: {
                                student: { select: { id: true, nickname: true } },
                            },
                        },
                    },
                },
                tests: {
                    include: {
                        results: {
                            include: {
                                student: { select: { id: true, nickname: true } },
                            },
                        },
                    },
                },
            },
            orderBy: { scheduledDate: 'asc' },
        });
    }

    async createLessonPlan(teacherHubId: string, classIdStr: string, data: {
        title: string; description?: string; scheduledDate?: string;
        dayOfWeek?: string; startTime?: string; endTime?: string;
        subject?: string; textbook?: string; totalSessions?: number;
    }) {
        const classId = parseInt(classIdStr, 10);
        await this.verifyClassOwnership(teacherHubId, classId);

        const plan = await this.prisma.tbLessonPlan.create({
            data: {
                classId,
                title: data.title,
                description: data.description ?? null,
                scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
                dayOfWeek: data.dayOfWeek ?? null,
                startTime: data.startTime ?? null,
                endTime: data.endTime ?? null,
                subject: data.subject ?? null,
                textbook: data.textbook ?? null,
                totalSessions: data.totalSessions ?? null,
            },
        });
        await this.syncLessonPlanSchedule(teacherHubId, classId, plan);
        return plan;
    }

    async updateLessonPlan(teacherHubId: string, classIdStr: string, planId: string, data: {
        title?: string; description?: string; scheduledDate?: string; progress?: number;
        dayOfWeek?: string; startTime?: string; endTime?: string;
        subject?: string; textbook?: string; totalSessions?: number;
    }) {
        const classId = parseInt(classIdStr, 10);
        await this.verifyClassOwnership(teacherHubId, classId);

        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.scheduledDate !== undefined)
            updateData.scheduledDate = data.scheduledDate ? new Date(data.scheduledDate) : null;
        if (data.progress !== undefined) updateData.progress = data.progress;
        if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek;
        if (data.startTime !== undefined) updateData.startTime = data.startTime;
        if (data.endTime !== undefined) updateData.endTime = data.endTime;
        if (data.subject !== undefined) updateData.subject = data.subject;
        if (data.textbook !== undefined) updateData.textbook = data.textbook;
        if (data.totalSessions !== undefined) updateData.totalSessions = data.totalSessions;

        const plan = await this.prisma.tbLessonPlan.update({
            where: { id: planId },
            data: updateData,
        });
        await this.syncLessonPlanSchedule(teacherHubId, classId, plan);
        return plan;
    }

    async deleteLessonPlan(teacherHubId: string, classIdStr: string, planId: string) {
        const classId = parseInt(classIdStr, 10);
        await this.verifyClassOwnership(teacherHubId, classId);

        return this.prisma.tbLessonPlan.delete({
            where: { id: planId },
        });
    }

    // ===== LESSON RECORDS =====

    async createLessonRecord(teacherHubId: string, classIdStr: string, data: {
        lessonPlanId: string; recordDate?: string; summary?: string;
        pagesFrom?: number; pagesTo?: number; conceptNote?: string; fileUrl?: string;
    }) {
        const classId = parseInt(classIdStr, 10);
        await this.verifyClassOwnership(teacherHubId, classId);

        return this.prisma.tbLessonRecord.create({
            data: {
                lessonPlanId: data.lessonPlanId,
                recordDate: data.recordDate ? new Date(data.recordDate) : null,
                summary: data.summary,
                pagesFrom: data.pagesFrom,
                pagesTo: data.pagesTo,
                conceptNote: data.conceptNote,
                fileUrl: data.fileUrl,
            },
        });
    }

    /** 수업계획을 Classboard 일정에 동기화 (과목 + 선생님명만 표식) */
    private async syncLessonPlanSchedule(
        teacherHubId: string,
        classId: number,
        plan: { id: string; subject: string | null; scheduledDate: Date | null },
    ) {
        try {
            if (!plan.scheduledDate) {
                await this.sharedSchedule.removeLessonPlan(plan.id);
                return;
            }
            const [cls, teacher, links] = await Promise.all([
                this.prisma.mentoring_class_tb.findUnique({
                    where: { id: classId },
                    select: { name: true, subject: true },
                }),
                this.prisma.auth_member.findUnique({
                    where: { id: teacherHubId },
                    select: { nickname: true },
                }),
                this.prisma.mentoring_account_link_tb.findMany({
                    where: { class_id: classId },
                }),
            ]);
            const teacherName = teacher?.nickname || '선생님';
            const subject = plan.subject || cls?.subject || '수업';
            const studentIds = [
                ...new Set(
                    links
                        .map((l) => (l.member_id === teacherHubId ? l.linked_member_id : l.member_id))
                        .filter((id): id is string => !!id && id !== teacherHubId),
                ),
            ];
            await this.sharedSchedule.syncLessonPlan(
                plan.id,
                plan.scheduledDate,
                subject,
                teacherName,
                cls?.name || '',
                studentIds,
            );
        } catch (e) {
            this.logger.error(`수업계획 일정 동기화 실패 (plan ${plan.id})`, e);
        }
    }

    // ===== ATTENDANCE =====

    async bulkCheckAttendance(teacherHubId: string, classIdStr: string, data: {
        date: string;
        records: Array<{ studentId: string; status: 'present' | 'late' | 'absent'; note?: string }>;
    }) {
        const classId = parseInt(classIdStr, 10);
        await this.verifyClassOwnership(teacherHubId, classId);

        const date = new Date(data.date);

        const results = await Promise.all(
            data.records.map((record) =>
                this.prisma.tbAttendance.upsert({
                    where: {
                        classId_studentId_date: {
                            classId,
                            studentId: record.studentId,
                            date,
                        },
                    },
                    create: {
                        classId,
                        studentId: record.studentId,
                        date,
                        status: record.status,
                        note: record.note,
                    },
                    update: {
                        status: record.status,
                        note: record.note,
                    },
                }),
            ),
        );

        return { updated: results.length };
    }

    async getAttendance(teacherHubId: string, classIdStr: string, date?: string) {
        const classId = parseInt(classIdStr, 10);
        await this.verifyClassOwnership(teacherHubId, classId);

        const where: any = { classId };
        if (date) where.date = new Date(date);

        const attendances = await this.prisma.tbAttendance.findMany({
            where,
            include: {
                student: { select: { id: true, nickname: true } },
            },
            orderBy: [{ date: 'desc' }],
        });
        
        return attendances.map(a => ({
            ...a,
            student: { ...a.student, username: a.student.nickname, avatarUrl: null }
        }));
    }

    // ===== TESTS =====

    async createTest(teacherHubId: string, classIdStr: string, data: {
        lessonId: string; title: string; description?: string; testDate?: string; maxScore: number;
    }) {
        const classId = parseInt(classIdStr, 10);
        await this.verifyClassOwnership(teacherHubId, classId);

        const test = await this.prisma.tbTest.create({
            data: {
                lessonId: data.lessonId,
                title: data.title,
                description: data.description,
                testDate: data.testDate ? new Date(data.testDate) : null,
                maxScore: data.maxScore,
            },
            include: { lesson: { include: { class: true } } },
        });

        if (test.lesson) {
            const links = await this.prisma.mentoring_account_link_tb.findMany({
                where: { class_id: classId }
            });
            for (const link of links) {
                const studentId = link.member_id === teacherHubId ? link.linked_member_id : link.member_id;
                await this.sharedSchedule.syncTest(
                    String(studentId),
                    test as any,
                    test.lesson as any,
                );
            }
        }

        return test;
    }

    async bulkInputTestResults(teacherHubId: string, testId: string, results: Array<{
        studentId: string; score: number; feedback?: string;
    }>) {
        const test = await this.prisma.tbTest.findUnique({
            where: { id: testId },
            include: { lesson: { include: { class: true } } },
        });

        if (!test) throw new NotFoundException('Test not found');
        await this.verifyClassOwnership(teacherHubId, test.lesson.classId);

        const upsertResults = await Promise.all(
            results.map((r) =>
                this.prisma.tbTestResult.upsert({
                    where: { testId_studentId: { testId, studentId: r.studentId } },
                    create: { testId, studentId: r.studentId, score: r.score, feedback: r.feedback },
                    update: { score: r.score, feedback: r.feedback },
                }),
            ),
        );

        return { updated: upsertResults.length };
    }

    async getTestResults(teacherHubId: string, testId: string) {
        const test = await this.prisma.tbTest.findUnique({
            where: { id: testId },
            include: { lesson: { include: { class: true } } },
        });

        if (!test) throw new NotFoundException('Test not found');
        await this.verifyClassOwnership(teacherHubId, test.lesson.classId);

        const results = await this.prisma.tbTestResult.findMany({
            where: { testId },
            include: {
                student: { select: { id: true, nickname: true } },
            },
            orderBy: { score: 'desc' },
        });
        
        return results.map(r => ({
            ...r,
            student: { ...r.student, username: r.student.nickname, avatarUrl: null }
        }));
    }

    // ===== ASSIGNMENTS =====

    async createAssignment(teacherHubId: string, classIdStr: string, data: {
        lessonId: string; title: string; description?: string; dueDate?: string; fileUrl?: string;
    }) {
        const classId = parseInt(classIdStr, 10);
        await this.verifyClassOwnership(teacherHubId, classId);

        const assignment = await this.prisma.tbAssignment.create({
            data: {
                lessonId: data.lessonId,
                title: data.title,
                description: data.description,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                fileUrl: data.fileUrl,
            },
            include: { lesson: { include: { class: true } } },
        });

        if (assignment.lesson) {
            const links = await this.prisma.mentoring_account_link_tb.findMany({
                where: { class_id: classId }
            });
            for (const link of links) {
                const studentId = link.member_id === teacherHubId ? link.linked_member_id : link.member_id;
                await this.sharedSchedule.syncAssignment(
                    String(studentId),
                    assignment as any,
                    assignment.lesson as any,
                );
            }
        }

        return assignment;
    }

    async getAssignmentSubmissions(teacherHubId: string, assignmentId: string) {
        const assignment = await this.prisma.tbAssignment.findUnique({
            where: { id: assignmentId },
            include: { lesson: { include: { class: true } } },
        });

        if (!assignment) throw new NotFoundException('Assignment not found');
        await this.verifyClassOwnership(teacherHubId, assignment.lesson.classId);

        const submissions = await this.prisma.tbAssignmentSubmission.findMany({
            where: { assignmentId },
            include: {
                student: { select: { id: true, nickname: true } },
            },
            orderBy: { submittedAt: 'desc' },
        });
        
        return submissions.map(s => ({
            ...s,
            student: { ...s.student, username: s.student.nickname, avatarUrl: null }
        }));
    }

    async gradeSubmission(teacherHubId: string, submissionId: string, data: {
        grade?: number; feedback?: string; status?: string;
    }) {
        const submission = await this.prisma.tbAssignmentSubmission.findUnique({
            where: { id: submissionId },
            include: { assignment: { include: { lesson: { include: { class: true } } } } },
        });

        if (!submission) throw new NotFoundException('Submission not found');
        await this.verifyClassOwnership(teacherHubId, submission.assignment.lesson.classId);

        return this.prisma.tbAssignmentSubmission.update({
            where: { id: submissionId },
            data: {
                grade: data.grade,
                feedback: data.feedback,
                status: (data.status as any) || 'graded',
            },
        });
    }

    // ===== STUDENT DATA VIEWING (선생님이 학생 앱 데이터 열람) =====

    /**
     * 선생님이 해당 학생에게 접근 가능한지 검증 (Hub 계정 연동 테이블 사용)
     */
    private async verifyStudentAccess(teacherHubId: string, studentId: string) {
        const links = await this.prisma.mentoring_account_link_tb.findMany({
            where: {
                OR: [
                    { member_id: teacherHubId, linked_member_id: studentId },
                    { member_id: studentId, linked_member_id: teacherHubId }
                ]
            }
        });

        if (links.length === 0) {
            throw new ForbiddenException('이 학생에 대한 접근 권한이 없습니다.');
        }

        return links;
    }

    /**
     * 학생 학습 요약 (Overview)
     */
    async getStudentOverview(teacherHubId: string, studentId: string) {
        const links = await this.verifyStudentAccess(teacherHubId, studentId);

        const student = await this.prisma.auth_member.findUnique({
            where: { id: studentId },
            select: { id: true, nickname: true, email: true, phone: true },
        });

        if (!student) throw new NotFoundException('학생을 찾을 수 없습니다.');

        const classIds = links.filter(l => l.class_id).map(l => l.class_id as number);

        const classes = await this.prisma.mentoring_class_tb.findMany({
            where: { id: { in: classIds } }
        });

        const [totalAssignments, submittedAssignments] = await Promise.all([
            this.prisma.tbAssignment.count({
                where: { lesson: { classId: { in: classIds } } },
            }),
            this.prisma.tbAssignmentSubmission.count({
                where: { studentId, assignment: { lesson: { classId: { in: classIds } } } },
            }),
        ]);

        const testResults = await this.prisma.tbTestResult.findMany({
            where: { studentId, test: { lesson: { classId: { in: classIds } } } },
            include: { test: { select: { maxScore: true, title: true } } },
            orderBy: { takenAt: 'desc' },
            take: 5,
        });

        const avgScore = testResults.length > 0
            ? Math.round(testResults.reduce((sum, r) => {
                const max = r.test.maxScore > 0 ? r.test.maxScore : 100;
                return sum + (r.score / max) * 100;
            }, 0) / testResults.length)
            : null;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const attendances = await this.prisma.tbAttendance.findMany({
            where: {
                studentId,
                classId: { in: classIds },
                date: { gte: thirtyDaysAgo },
            },
        });

        const attendanceStats = {
            total: attendances.length,
            present: attendances.filter((a) => a.status === 'present').length,
            late: attendances.filter((a) => a.status === 'late').length,
            absent: attendances.filter((a) => a.status === 'absent').length,
        };

        const commentCount = await this.prisma.tbPrivateComment.count({
            where: { studentId },
        });

        return {
            student: { ...student, username: student.nickname, avatarUrl: null },
            classes: classes.map(c => ({ ...c, name: c.name, subject: c.subject })),
            stats: {
                assignments: { total: totalAssignments, submitted: submittedAssignments },
                tests: { count: testResults.length, avgScore, recentResults: testResults },
                attendance: attendanceStats,
                commentCount,
            },
        };
    }

    /**
     * 학생의 과제 목록 및 제출 현황
     */
    async getStudentAssignments(teacherHubId: string, studentId: string) {
        const links = await this.verifyStudentAccess(teacherHubId, studentId);
        const classIds = links.filter(l => l.class_id).map(l => l.class_id as number);

        return this.prisma.tbAssignment.findMany({
            where: { lesson: { classId: { in: classIds } } },
            include: {
                lesson: {
                    select: { title: true, class: { select: { name: true, subject: true } } },
                },
                submissions: {
                    where: { studentId },
                    select: {
                        id: true, status: true, grade: true,
                        feedback: true, submittedAt: true, submissionFileUrl: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * 학생의 시험 결과
     */
    async getStudentTests(teacherHubId: string, studentId: string) {
        const links = await this.verifyStudentAccess(teacherHubId, studentId);
        const classIds = links.filter(l => l.class_id).map(l => l.class_id as number);

        return this.prisma.tbTest.findMany({
            where: { lesson: { classId: { in: classIds } } },
            include: {
                lesson: {
                    select: { title: true, class: { select: { name: true, subject: true } } },
                },
                results: {
                    where: { studentId },
                    select: {
                        id: true, score: true, feedback: true,
                        wrongAnswerNote: true, takenAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * 학생의 출석 기록
     */
    async getStudentAttendance(teacherHubId: string, studentId: string) {
        const links = await this.verifyStudentAccess(teacherHubId, studentId);
        const classIds = links.filter(l => l.class_id).map(l => l.class_id as number);

        const attendances = await this.prisma.tbAttendance.findMany({
            where: { studentId, classId: { in: classIds } },
            include: {
                class: { select: { name: true, subject: true } },
            },
            orderBy: { date: 'desc' },
        });
        
        return attendances.map(a => ({
           id: a.id,
           date: a.date,
           status: a.status,
           note: a.note,
           class: a.class 
        }));
    }

    // ===== PRIVATE COMMENTS =====

    async createPrivateComment(teacherHubId: string, data: {
        targetId: string; studentId?: string; contextType?: string;
        contextId?: string; content: string; imageUrl?: string;
    }) {
        return this.prisma.tbPrivateComment.create({
            data: {
                authorId: teacherHubId,
                targetId: data.targetId,
                studentId: data.studentId,
                contextType: data.contextType,
                contextId: data.contextId,
                content: data.content,
                imageUrl: data.imageUrl,
            },
            include: {
                author: { select: { id: true, nickname: true, role_type: true } },
                target: { select: { id: true, nickname: true, role_type: true } },
            },
        });
    }

    async getPrivateComments(teacherHubId: string, studentId: string) {
        const comments = await this.prisma.tbPrivateComment.findMany({
            where: {
                studentId,
                OR: [{ authorId: teacherHubId }, { targetId: teacherHubId }],
            },
            include: {
                author: { select: { id: true, nickname: true, role_type: true } },
                target: { select: { id: true, nickname: true, role_type: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
        
        return comments.map(c => ({
            ...c,
            author: { ...c.author, username: c.author.nickname, role: c.author.role_type, avatarUrl: null },
            target: { ...c.target, username: c.target.nickname, role: c.target.role_type, avatarUrl: null }
        }));
    }

    // ===== CLASS REQUESTS (removed logic) =====

    async getClassRequests(_hubId: string) {
        return [];
    }

    async respondToClassRequest(_hubId: string, _requestId: string, _data: any) {
        throw new ForbiddenException('Use Hub System for requests.');
    }

    // ===== HELPERS =====

    private async verifyClassOwnership(teacherHubId: string, classId: number) {
        const cls = await this.prisma.mentoring_class_tb.findUnique({
            where: { id: classId },
            select: { teacher_id: true },
        });

        if (!cls) throw new NotFoundException('Class not found');
        if (cls.teacher_id !== teacherHubId) throw new ForbiddenException('Not your class');
    }
}
