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
        const [classes, recentComments] = await Promise.all([
            this.prisma.mentoring_class_tb.findMany({
                where: { teacher_id: teacherHubId, is_active: true },
                include: {
                    _count: { select: { lessonPlans: true } },
                },
                orderBy: { created_at: 'desc' },
            }),
            this.prisma.tbPrivateComment.findMany({
                where: {
                    OR: [{ authorId: teacherHubId }, { targetId: teacherHubId }],
                },
                include: {
                    author: { select: { id: true, nickname: true, role_type: true } },
                    target: { select: { id: true, nickname: true, role_type: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
        ]);

        return { classes, recentComments };
    }

    async getMyClasses(teacherHubId: string) {
        return this.prisma.mentoring_class_tb.findMany({
            where: { teacher_id: teacherHubId, is_active: true },
            orderBy: { created_at: 'desc' },
        });
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
    }) {
        const classId = parseInt(classIdStr, 10);
        await this.verifyClassOwnership(teacherHubId, classId);

        return this.prisma.tbLessonPlan.create({
            data: {
                classId,
                title: data.title,
                description: data.description,
                scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
            },
        });
    }

    async updateLessonPlan(teacherHubId: string, classIdStr: string, planId: string, data: {
        title?: string; description?: string; scheduledDate?: string; progress?: number;
    }) {
        const classId = parseInt(classIdStr, 10);
        await this.verifyClassOwnership(teacherHubId, classId);

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

    async deleteLessonPlan(teacherHubId: string, classIdStr: string, planId: string) {
        const classId = parseInt(classIdStr, 10);
        await this.verifyClassOwnership(teacherHubId, classId);

        return this.prisma.tbLessonPlan.delete({
            where: { id: planId },
        });
    }

    // ===== LESSON RECORDS =====

    async createLessonRecord(teacherHubId: string, classIdStr: string, data: {
        lessonPlanId: string; recordDate: string; summary?: string;
        pagesFrom?: number; pagesTo?: number; conceptNote?: string; fileUrl?: string;
    }) {
        const classId = parseInt(classIdStr, 10);
        await this.verifyClassOwnership(teacherHubId, classId);

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
            ? Math.round(testResults.reduce((sum, r) => sum + (r.score / r.test.maxScore) * 100, 0) / testResults.length)
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
