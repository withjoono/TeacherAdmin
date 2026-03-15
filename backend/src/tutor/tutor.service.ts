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

    // ===== STUDENT DATA VIEWING (선생님이 학생 앱 데이터 열람) =====

    /**
     * 선생님이 해당 학생에게 접근 가능한지 검증
     * (선생님의 클래스에 등록된 학생인지 확인)
     */
    private async verifyStudentAccess(teacherId: string, studentId: string) {
        const enrollment = await this.prisma.tbClassEnrollment.findFirst({
            where: {
                studentId,
                class: { teacherId },
            },
            include: {
                student: {
                    select: { id: true, username: true, email: true, phone: true, avatarUrl: true },
                },
                class: {
                    select: { id: true, name: true, subject: true },
                },
            },
        });

        if (!enrollment) {
            throw new ForbiddenException('이 학생에 대한 접근 권한이 없습니다.');
        }

        return enrollment;
    }

    /**
     * 학생 학습 요약 (Overview)
     * - 기본 정보, 소속 클래스, 과제/시험/출석 요약 통계
     */
    async getStudentOverview(hubId: string, studentId: string) {
        const user = await this.resolveTeacher(hubId);
        await this.verifyStudentAccess(user.id, studentId);

        const student = await this.prisma.tbUser.findUnique({
            where: { id: studentId },
            select: { id: true, username: true, email: true, phone: true, avatarUrl: true },
        });

        if (!student) throw new NotFoundException('학생을 찾을 수 없습니다.');

        // 이 선생님의 클래스에서 해당 학생의 등록 정보
        const enrollments = await this.prisma.tbClassEnrollment.findMany({
            where: {
                studentId,
                class: { teacherId: user.id },
            },
            include: {
                class: { select: { id: true, name: true, subject: true } },
            },
        });

        const classIds = enrollments.map((e) => e.classId);

        // 과제 제출 통계
        const [totalAssignments, submittedAssignments] = await Promise.all([
            this.prisma.tbAssignment.count({
                where: { lesson: { classId: { in: classIds } } },
            }),
            this.prisma.tbAssignmentSubmission.count({
                where: { studentId, assignment: { lesson: { classId: { in: classIds } } } },
            }),
        ]);

        // 시험 통계
        const testResults = await this.prisma.tbTestResult.findMany({
            where: { studentId, test: { lesson: { classId: { in: classIds } } } },
            include: { test: { select: { maxScore: true, title: true } } },
            orderBy: { takenAt: 'desc' },
            take: 5,
        });

        const avgScore = testResults.length > 0
            ? Math.round(testResults.reduce((sum, r) => sum + (r.score / r.test.maxScore) * 100, 0) / testResults.length)
            : null;

        // 출석 통계 (최근 30일)
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

        // 최근 코멘트 수
        const commentCount = await this.prisma.tbPrivateComment.count({
            where: { studentId },
        });

        return {
            student,
            classes: enrollments.map((e) => e.class),
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
    async getStudentAssignments(hubId: string, studentId: string) {
        const user = await this.resolveTeacher(hubId);
        await this.verifyStudentAccess(user.id, studentId);

        const classIds = (await this.prisma.tbClassEnrollment.findMany({
            where: { studentId, class: { teacherId: user.id } },
            select: { classId: true },
        })).map((e) => e.classId);

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
    async getStudentTests(hubId: string, studentId: string) {
        const user = await this.resolveTeacher(hubId);
        await this.verifyStudentAccess(user.id, studentId);

        const classIds = (await this.prisma.tbClassEnrollment.findMany({
            where: { studentId, class: { teacherId: user.id } },
            select: { classId: true },
        })).map((e) => e.classId);

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
    async getStudentAttendance(hubId: string, studentId: string) {
        const user = await this.resolveTeacher(hubId);
        await this.verifyStudentAccess(user.id, studentId);

        const classIds = (await this.prisma.tbClassEnrollment.findMany({
            where: { studentId, class: { teacherId: user.id } },
            select: { classId: true },
        })).map((e) => e.classId);

        return this.prisma.tbAttendance.findMany({
            where: { studentId, classId: { in: classIds } },
            include: {
                class: { select: { name: true, subject: true } },
            },
            orderBy: { date: 'desc' },
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

    // ===== CLASS REQUESTS =====

    async getClassRequests(hubId: string) {
        const user = await this.resolveTeacher(hubId);

        return this.prisma.tbClassRequest.findMany({
            where: { teacherId: user.id },
            include: {
                requester: { select: { id: true, username: true, email: true, role: true, avatarUrl: true } },
                class: { select: { id: true, name: true, subject: true } },
            },
            orderBy: [
                { status: 'asc' }, // pending first
                { createdAt: 'desc' },
            ],
        });
    }

    async respondToClassRequest(hubId: string, requestId: string, data: {
        action: 'accepted' | 'rejected';
        className?: string;
        subject?: string;
        existingClassId?: string;
    }) {
        const user = await this.resolveTeacher(hubId);

        const request = await this.prisma.tbClassRequest.findUnique({
            where: { id: requestId },
            include: { requester: true },
        });

        if (!request) throw new NotFoundException('요청을 찾을 수 없습니다.');
        if (request.teacherId !== user.id) throw new ForbiddenException('이 요청에 대한 권한이 없습니다.');
        if (request.status !== 'pending') throw new ForbiddenException('이미 처리된 요청입니다.');

        if (data.action === 'accepted') {
            let classId: string;

            if (data.existingClassId) {
                // 기존 반에 배정
                await this.verifyClassOwnership(user.id, data.existingClassId);
                classId = data.existingClassId;
            } else {
                // 새 반 개설
                const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
                const newClass = await this.prisma.tbClass.create({
                    data: {
                        teacherId: user.id,
                        name: data.className || `${request.subject || '수업'} - ${request.requester.username}`,
                        subject: data.subject || request.subject || '기타',
                        inviteCode,
                    },
                });
                classId = newClass.id;
            }

            // 학생 등록
            await this.prisma.tbClassEnrollment.upsert({
                where: {
                    classId_studentId: {
                        classId,
                        studentId: request.requesterId,
                    },
                },
                create: {
                    classId,
                    studentId: request.requesterId,
                },
                update: {},
            });

            // 요청 상태 업데이트
            await this.prisma.tbClassRequest.update({
                where: { id: requestId },
                data: {
                    status: 'accepted',
                    classId,
                    respondedAt: new Date(),
                },
            });

            // 학생에게 알림
            const cls = await this.prisma.tbClass.findUnique({ where: { id: classId } });
            await this.prisma.tbNotification.create({
                data: {
                    userId: request.requesterId,
                    message: `📚 [${cls?.name}]에 등록되었습니다! 수업 현황을 확인하세요.`,
                    type: 'general',
                    referenceId: classId,
                    referenceType: 'class',
                },
            });

            return { status: 'accepted', classId };
        } else {
            // 거절
            await this.prisma.tbClassRequest.update({
                where: { id: requestId },
                data: {
                    status: 'rejected',
                    respondedAt: new Date(),
                },
            });

            // 요청자에게 알림
            await this.prisma.tbNotification.create({
                data: {
                    userId: request.requesterId,
                    message: `수업 요청이 거절되었습니다. 선생님에게 문의해 주세요.`,
                    type: 'general',
                    referenceId: requestId,
                    referenceType: 'class_request',
                },
            });

            return { status: 'rejected' };
        }
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
