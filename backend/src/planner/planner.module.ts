import { Module } from '@nestjs/common';
import { PlannerController } from './planner.controller';
import { PlannerService } from './planner.service';

/**
 * 플래너 검사·채점 모듈
 * StudyPlanner(public 스키마)의 플래너를 조회하고 채점한다.
 */
@Module({
  controllers: [PlannerController],
  providers: [PlannerService],
})
export class PlannerModule {}
