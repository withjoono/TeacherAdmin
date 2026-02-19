import { Module } from '@nestjs/common';
import { TutorController } from './tutor.controller';
import { TutorService } from './tutor.service';
import { PrismaModule } from '../prisma';
import { SharedScheduleService } from './shared-schedule.service';

@Module({
    imports: [PrismaModule],
    controllers: [TutorController],
    providers: [TutorService, SharedScheduleService],
})
export class TutorModule { }
