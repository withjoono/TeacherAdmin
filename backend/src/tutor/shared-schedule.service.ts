import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SharedScheduleService {
    private readonly logger = new Logger(SharedScheduleService.name);

    constructor(private readonly prisma: PrismaService) { }

    async syncAssignment(
        hubUserId: string,
        assignment: { id: string; title: string; dueDate?: Date | null },
        lesson: { title: string; class: { name: string; subject?: string } },
    ) {
        if (!assignment.dueDate) return;

        try {
            await this.prisma.hubSharedSchedule.upsert({
                where: {
                    uk_hub_schedule_source: {
                        sourceApp: 'tutorboard',
                        eventType: 'assignment',
                        sourceId: assignment.id,
                    },
                },
                create: {
                    hubUserId: String(hubUserId),
                    sourceApp: 'tutorboard',
                    eventType: 'assignment',
                    sourceId: assignment.id,
                    title: `[과제] ${assignment.title}`,
                    description: `${lesson.class.name} - ${lesson.title}`,
                    eventDate: assignment.dueDate,
                    subject: lesson.class.subject || null,
                    metadata: { className: lesson.class.name, lessonTitle: lesson.title },
                },
                update: {
                    title: `[과제] ${assignment.title}`,
                    description: `${lesson.class.name} - ${lesson.title}`,
                    eventDate: assignment.dueDate,
                    subject: lesson.class.subject || null,
                    metadata: { className: lesson.class.name, lessonTitle: lesson.title },
                },
            });
        } catch (error) {
            this.logger.error(`Failed to sync assignment ${assignment.id}`, error);
        }
    }

    async syncTest(
        hubUserId: string,
        test: { id: string; title: string; testDate?: Date | null },
        lesson: { title: string; class: { name: string; subject?: string } },
    ) {
        if (!test.testDate) return;

        try {
            await this.prisma.hubSharedSchedule.upsert({
                where: {
                    uk_hub_schedule_source: {
                        sourceApp: 'tutorboard',
                        eventType: 'test',
                        sourceId: test.id,
                    },
                },
                create: {
                    hubUserId: String(hubUserId),
                    sourceApp: 'tutorboard',
                    eventType: 'test',
                    sourceId: test.id,
                    title: `[시험] ${test.title}`,
                    description: `${lesson.class.name} - ${lesson.title}`,
                    eventDate: test.testDate,
                    subject: lesson.class.subject || null,
                    metadata: { className: lesson.class.name, lessonTitle: lesson.title },
                },
                update: {
                    title: `[시험] ${test.title}`,
                    description: `${lesson.class.name} - ${lesson.title}`,
                    eventDate: test.testDate,
                    subject: lesson.class.subject || null,
                    metadata: { className: lesson.class.name, lessonTitle: lesson.title },
                },
            });
        } catch (error) {
            this.logger.error(`Failed to sync test ${test.id}`, error);
        }
    }

    /**
     * 수업계획을 각 학생의 Classboard 일정에 동기화한다.
     * 일정에는 과목과 선생님명만 표식한다.
     */
    async syncLessonPlan(
        planId: string,
        scheduledDate: Date,
        subject: string,
        teacherName: string,
        className: string,
        studentHubIds: string[],
    ) {
        try {
            // 학생 구성 변동에 대응해 기존 일정 제거 후 재생성
            await this.prisma.hubSharedSchedule.deleteMany({
                where: {
                    sourceApp: 'tutorboard',
                    eventType: 'lesson',
                    sourceId: { startsWith: `${planId}:` },
                },
            });
            for (const sid of studentHubIds) {
                await this.prisma.hubSharedSchedule.create({
                    data: {
                        hubUserId: String(sid),
                        sourceApp: 'tutorboard',
                        eventType: 'lesson',
                        sourceId: `${planId}:${sid}`.slice(0, 50),
                        title: subject,
                        description: teacherName,
                        eventDate: scheduledDate,
                        subject,
                        metadata: { teacherName, className },
                    },
                });
            }
        } catch (error) {
            this.logger.error(`Failed to sync lesson plan ${planId}`, error);
        }
    }

    /** 수업계획 일정 제거 (날짜가 비워졌거나 삭제된 경우) */
    async removeLessonPlan(planId: string) {
        try {
            await this.prisma.hubSharedSchedule.deleteMany({
                where: {
                    sourceApp: 'tutorboard',
                    eventType: 'lesson',
                    sourceId: { startsWith: `${planId}:` },
                },
            });
        } catch (error) {
            this.logger.error(`Failed to remove lesson plan ${planId}`, error);
        }
    }

    async removeEvent(eventType: string, sourceId: string) {
        try {
            await this.prisma.hubSharedSchedule.deleteMany({
                where: {
                    sourceApp: 'tutorboard',
                    eventType,
                    sourceId,
                },
            });
        } catch (error) {
            this.logger.error(`Failed to remove ${eventType} ${sourceId}`, error);
        }
    }
}
