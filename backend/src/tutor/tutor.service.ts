import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { SharedScheduleService } from './shared-schedule.service';

@Injectable()
export class TutorService {
    private readonly logger = new Logger(TutorService.name);

    constructor(
        private prisma: PrismaService,
        private sharedSchedule: SharedScheduleService,
    ) { }

    // ===== HELPER: Hub ID → TbUser 변환 =====
    private async resolveTeacher(hubId: string) {
        const hubUserId = parseInt(hubId, 10);
        let user = await this.prisma.tbUser.findUnique({
            where: { hubUserId },
        });

        if (!user) {
            // 자동 생성 (첫 접속 시)
            user = await this.prisma.tbUser.create({
                data: {
                    hubUserId,
                    username: `teacher_${hubId}`,
                    email: `teacher_${hubId}@tutorboard.local`,
                    role: 'teacher',
                },
            });
        }

        return user;
    }

    // ===== CLASS MANAGEMENT =====

    async getTeacherDashboard(hubId: string) {
        const user = await this.resolveTeacher(hubId);
        const teacherId = user.id;

        const [classes, recentComments] = await Promise.all([
            this.prisma.tbClass.findMany({
                where: { teacherId },
                include: {
                    _count: { select: { enrollments: true, lessonPlans: true } },
                    enrollments: {
                        include: {
                            student: { select: { id: true, username: true, avatarUrl: true } },
                            parent: { select: { id: true, username: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.tbPrivateComment.findMany({
                where: {
                    OR: [{ authorId: teacherId }, { targetId: teacherId }],
                },
                include: {
                    author: { select: { id: true, username: true, role: true } },
                    target: { select: { id: true, username: true, role: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
        ]);

        return { classes, recentComments };
    }

    async getMyClasses(hubId: string) {
        const user = await this.resolveTeacher(hubId);

        return this.prisma.tbClass.findMany({
            where: { teacherId: user.id },
            include: {
                _count: { select: { enrollments: true, lessonPlans: true } },
                enrollments: {
                    include: {
                        student: { select: { id: true, username: true, avatarUrl: true } },
                        parent: { select: { id: true, username: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getClassStudents(hubId: string, classId: string) {
        const user = await this.resolveTeacher(hubId);
        await this.verifyClassOwnership(user.id, classId);

        return this.prisma.tbClassEnrollment.findMany({
            where: { classId },
            include: {
                student: {
                    select: {
                        id: true, username: true, email: true, phone: true, avatarUrl: true,
                        attendances: {
                            where: { classId },
                            orderBy: { date: 'desc' },
                            take: 10,
                        },
                    },
                },
                parent: { select: { id: true, username: true, email: true, phone: true } },
            },
        });
    }

    // ===== LESSON PLANS =====

    async getLessonPlans(hubId: string, classId: string) {
        const user = await this.resolveTeacher(hubId);
        await this.verifyClassOwnership(user.id, classId);

        return this.prisma.tbLessonPlan.findMany({
            where: { classId },
            include: {
                records: { orderBy: { recordDate: 'desc' } },
                assignments: {
                    include: {
                        submissions: {
                            include: {
                                student: { select: { id: true, username: true } },
                            },
                        },
                    },
                },
                tests: {
                    include: {
                        results: {
                            include: {
                                student: { select: { id: true, username: true } },
                            },
                        },
                    },
                },
            },
            orderBy: { scheduledDate: 'asc' },
        });
    }

    async createLessonPlan(hubId: string, classId: string, data: {
        title: string; description?: string; scheduledDate?: string;
    }) {
        const user = await this.resolveTeacher(hubId);
        await this.verifyClassOwnership(user.id, classId);

        return this.prisma.tbLessonPlan.create({
            data: {
                classId,
                title: data.title,
                description: data.description,
                scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
            },
        });
    }

    async updateLessonPlan(hubId: string, classId: string, planId: string, data: {
        title?: string; description?: string; scheduledDate?: string; progress?: number;
    }) {
        const user = await this.resolveTeacher(hubId);
        await this.verifyClassOwnership(user.id, classId);

        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.scheduledDate !== undefined) updateData.scheduledDate = new Date(data.scheduledDate);
        if (data.progress !== undefined) updateData.progress = data.progress;

        return this.prisma.tbLessonPlan.update({
            where: { id: planId },
            data: updateData,
        });
    }

    async deleteLessonPlan(hubId: string, classId: string, planId: string) {
        const user = await this.resolveTeacher(hubId);
        await this.verifyClassOwnership(user.id, classId);

        return this.prisma.tbLessonPlan.delete({
            where: { id: planId },
        });
    }

    // ===== LESSON RECORDS =====

    async createLessonRecord(hubId: string, classId: string, data: {
        lessonPlanId: string; recordDate: string; summary?: string;
        pagesFrom?: number; pagesTo?: number; conceptNote?: string; fileUrl?: string;
    }) {
        const user = await this.resolveTeacher(hubId);
        await this.verifyClassOwnership(user.id, classId);

        return this.prisma.tbLessonRecord.create({
            data: {
                lessonPlanId: data.lessonPlanId,
                recordDate: new Date(data.recordDate),
                summary: data.summary,
                pagesFrom: data.pagesFrom,
                pagesTo: data.pagesTo,
                conceptNote: data.conceptNote,
                fileUrl: data.fileUrl,
            },
        });
    }

    // ===== ATTENDANCE =====

    async bulkCheckAttendance(hubId: string, classId: string, data: {
        date: string;
        records: Array<{ studentId: string; status: 'present' | 'late' | 'absent'; note?: string }>;
    }) {
        const user = await this.resolveTeacher(hubId);
        await this.verifyClassOwnership(user.id, classId);

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

    async getAttendance(hubId: string, classId: string, date?: string) {
        const user = await this.resolveTeacher(hubId);
        await this.verifyClassOwnership(user.id, classId);

        const where: any = { classId };
        if (date) where.date = new Date(date);

        return this.prisma.tbAttendance.findMany({
            where,
            include: {
                student: { select: { id: true, username: true, avatarUrl: true } },
            },
            orderBy: [{ date: 'desc' }, { student: { username: 'asc' } }],
        });
    }

    // ===== TESTS =====

    async createTest(hubId: string, classId: string, data: {
        lessonId: string; title: string; description?: string; testDate?: string; maxScore: number;
    }) {
        const user = await this.resolveTeacher(hubId);
        await this.verifyClassOwnership(user.id, classId);

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

        // 공유 스케줄 동기화
        if (test.lesson) {
            const enrollments = await this.prisma.tbClassEnrollment.findMany({
                where: { classId },
                include: { student: { select: { hubUserId: true } } },
            });
            for (const enrollment of enrollments) {
                if (enrollment.student.hubUserId) {
                    await this.sharedSchedule.syncTest(
                        String(enrollment.student.hubUserId),
                        test,
                        test.lesson,
                    );
                }
            }
        }

        return test;
    }

    async bulkInputTestResults(hubId: string, testId: string, results: Array<{
        studentId: string; score: number; feedback?: string;
    }>) {
        const user = await this.resolveTeacher(hubId);
        const test = await this.prisma.tbTest.findUnique({
            where: { id: testId },
            include: { lesson: { include: { class: true } } },
        });

        if (!test) throw new NotFoundException('Test not found');
        await this.verifyClassOwnership(user.id, test.lesson.classId);

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

    async getTestResults(hubId: string, testId: string) {
        const user = await this.resolveTeacher(hubId);
        const test = await this.prisma.tbTest.findUnique({
            where: { id: testId },
            include: { lesson: { include: { class: true } } },
        });

        if (!test) throw new NotFoundException('Test not found');
        await this.verifyClassOwnership(user.id, test.lesson.classId);

        return this.prisma.tbTestResult.findMany({
            where: { testId },
            include: {
                student: { select: { id: true, username: true, avatarUrl: true } },
            },
            orderBy: { score: 'desc' },
        });
    }

    // ===== ASSIGNMENTS =====

    async createAssignment(hubId: string, classId: string, data: {
        lessonId: string; title: string; description?: string; dueDate?: string; fileUrl?: string;
    }) {
        const user = await this.resolveTeacher(hubId);
        await this.verifyClassOwnership(user.id, classId);

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

        // 공유 스케줄 동기화
        if (assignment.lesson) {
            const enrollments = await this.prisma.tbClassEnrollment.findMany({
                where: { classId },
                include: { student: { select: { hubUserId: true } } },
            });
            for (const enrollment of enrollments) {
                if (enrollment.student.hubUserId) {
                    await this.sharedSchedule.syncAssignment(
                        String(enrollment.student.hubUserId),
                        assignment,
                        assignment.lesson,
                    );
                }
            }
        }

        return assignment;
    }

    async getAssignmentSubmissions(hubId: string, assignmentId: string) {
        const user = await this.resolveTeacher(hubId);
        const assignment = await this.prisma.tbAssignment.findUnique({
            where: { id: assignmentId },
            include: { lesson: { include: { class: true } } },
        });

        if (!assignment) throw new NotFoundException('Assignment not found');
        await this.verifyClassOwnership(user.id, assignment.lesson.classId);

        return this.prisma.tbAssignmentSubmission.findMany({
            where: { assignmentId },
            include: {
                student: { select: { id: true, username: true, avatarUrl: true } },
            },
            orderBy: { submittedAt: 'desc' },
        });
    }

    async gradeSubmission(hubId: string, submissionId: string, data: {
        grade?: number; feedback?: string; status?: string;
    }) {
        const user = await this.resolveTeacher(hubId);
        const submission = await this.prisma.tbAssignmentSubmission.findUnique({
            where: { id: submissionId },
            include: { assignment: { include: { lesson: { include: { class: true } } } } },
        });

        if (!submission) throw new NotFoundException('Submission not found');
        await this.verifyClassOwnership(user.id, submission.assignment.lesson.classId);

        return this.prisma.tbAssignmentSubmission.update({
            where: { id: submissionId },
            data: {
                grade: data.grade,
                feedback: data.feedback,
                status: (data.status as any) || 'graded',
            },
        });
    }

    // ===== PRIVATE COMMENTS =====

    async createPrivateComment(hubId: string, data: {
        targetId: string; studentId?: string; contextType?: string;
        contextId?: string; content: string; imageUrl?: string;
    }) {
        const user = await this.resolveTeacher(hubId);

        return this.prisma.tbPrivateComment.create({
            data: {
                authorId: user.id,
                targetId: data.targetId,
                studentId: data.studentId,
                contextType: data.contextType,
                contextId: data.contextId,
                content: data.content,
                imageUrl: data.imageUrl,
            },
            include: {
                author: { select: { id: true, username: true, role: true } },
                target: { select: { id: true, username: true, role: true } },
            },
        });
    }

    async getPrivateComments(hubId: string, studentId: string) {
        const user = await this.resolveTeacher(hubId);

        return this.prisma.tbPrivateComment.findMany({
            where: {
                studentId,
                OR: [{ authorId: user.id }, { targetId: user.id }],
            },
            include: {
                author: { select: { id: true, username: true, role: true, avatarUrl: true } },
                target: { select: { id: true, username: true, role: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    // ===== HELPERS =====

    private async verifyClassOwnership(teacherId: string, classId: string) {
        const cls = await this.prisma.tbClass.findUnique({
            where: { id: classId },
            select: { teacherId: true },
        });

        if (!cls) throw new NotFoundException('Class not found');
        if (cls.teacherId !== teacherId) throw new ForbiddenException('Not your class');
    }
}
