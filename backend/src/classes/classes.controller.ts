import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClassesService } from './classes.service';

@Controller('classes')
@UseGuards(AuthGuard('jwt'))
export class ClassesController {
    constructor(private readonly classesService: ClassesService) { }

    /**
     * POST /classes - 새 클래스 생성 (Hub mentoring_class_tb)
     */
    @Post()
    async createClass(
        @Request() req: any,
        @Body() body: { name: string; description?: string },
    ) {
        const teacherHubId = req.user.jti; // Hub memberId
        return this.classesService.createClass(
            teacherHubId,
            body.name,
            body.description,
        );
    }

    /**
     * GET /classes - 내 클래스 목록 조회 (Hub mentoring_class_tb)
     */
    @Get()
    async getMyClasses(@Request() req: any) {
        const teacherHubId = req.user.jti;
        return this.classesService.getMyClasses(teacherHubId);
    }

    /**
     * POST /classes/:id/students - 학생 일괄 등록 (Hub mentoring_account_link_tb)
     */
    @Post(':id/students')
    async importStudents(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: { studentIds: string[] },
    ) {
        const teacherHubId = req.user.jti;
        return this.classesService.importStudents(
            parseInt(id, 10),
            teacherHubId,
            body.studentIds,
        );
    }

    /**
     * GET /classes/:id/stats - 클래스 학습량 통계
     */
    @Get(':id/stats')
    async getClassStats(
        @Request() req: any,
        @Param('id') id: string,
        @Query('period') period?: 'daily' | 'weekly' | 'monthly',
    ) {
        const teacherHubId = req.user.jti;
        return this.classesService.getClassStats(
            parseInt(id, 10),
            teacherHubId,
            period || 'weekly',
        );
    }

    /**
     * GET /classes/:id/members - 클래스 멤버 목록
     */
    @Get(':id/members')
    async getClassMembers(
        @Request() req: any,
        @Param('id') id: string,
    ) {
        const teacherHubId = req.user.jti;
        return this.classesService.getClassMembers(
            parseInt(id, 10),
            teacherHubId,
        );
    }
}
