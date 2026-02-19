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
