import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PlannerService } from './planner.service';

/**
 * 플래너 검사·채점 컨트롤러
 *
 * 기존 tutor 컨트롤러와 동일하게 Hub SSO JWT 로 보호되며,
 * req.user.jti(= Hub member ID)를 선생님 식별자로 사용한다.
 */
@Controller('tutor')
@UseGuards(AuthGuard('jwt'))
export class PlannerController {
  constructor(private readonly plannerService: PlannerService) {}

  /** Hub JWT 의 jti 를 선생님 Hub member ID 로 사용 */
  private getHubId(req: any): string {
    return req.user?.jti;
  }

  /** 학생 플래너 조회 (date 미지정 시 오늘) */
  @Get('students/:studentId/planner')
  getStudentPlanner(
    @Req() req: any,
    @Param('studentId') studentId: string,
    @Query('date') date?: string,
  ) {
    return this.plannerService.getStudentPlanner(this.getHubId(req), studentId, date);
  }

  /** 학생 채점 이력 조회 */
  @Get('students/:studentId/planner-ratings')
  getStudentRatings(@Req() req: any, @Param('studentId') studentId: string) {
    return this.plannerService.getStudentRatings(this.getHubId(req), studentId);
  }

  /** 1~10점 성취도 점수 + 코멘트 채점 */
  @Post('students/:studentId/planner-ratings')
  rateStudent(
    @Req() req: any,
    @Param('studentId') studentId: string,
    @Body() body: { date: string; score: number; comment?: string },
  ) {
    return this.plannerService.rateStudent(this.getHubId(req), studentId, body);
  }
}
