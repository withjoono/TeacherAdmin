import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TutorService } from './tutor.service';

@Controller('tutor')
@UseGuards(AuthGuard('jwt'))
export class TutorController {
    constructor(private readonly tutorService: TutorService) { }

    // Hub JWT의 jti를 teacherId로 사용하기 위해 TbUser를 조회하는 헬퍼
    private getHubId(req: any): string {
        return req.user.jti; // Hub member ID
    }

    // ===== DASHBOARD =====
    @Get('dashboard')
    getDashboard(@Req() req: any) {
        return this.tutorService.getTeacherDashboard(this.getHubId(req));
    }

    // ===== CLASS MANAGEMENT =====
    @Get('classes')
    getMyClasses(@Req() req: any) {
        return this.tutorService.getMyClasses(this.getHubId(req));
    }

    @Get('classes/:classId/students')
    getClassStudents(@Req() req: any, @Param('classId') classId: string) {
        return this.tutorService.getClassStudents(this.getHubId(req), classId);
    }

    // ===== LESSON PLANS =====
    @Get('classes/:classId/lesson-plans')
    getLessonPlans(@Req() req: any, @Param('classId') classId: string) {
        return this.tutorService.getLessonPlans(this.getHubId(req), classId);
    }

    @Post('classes/:classId/lesson-plans')
    createLessonPlan(
        @Req() req: any,
        @Param('classId') classId: string,
        @Body() body: { title: string; description?: string; scheduledDate?: string },
    ) {
        return this.tutorService.createLessonPlan(this.getHubId(req), classId, body);
    }

    @Put('classes/:classId/lesson-plans/:planId')
    updateLessonPlan(
        @Req() req: any,
        @Param('classId') classId: string,
        @Param('planId') planId: string,
        @Body() body: { title?: string; description?: string; scheduledDate?: string; progress?: number },
    ) {
        return this.tutorService.updateLessonPlan(this.getHubId(req), classId, planId, body);
    }

    @Delete('classes/:classId/lesson-plans/:planId')
    deleteLessonPlan(
        @Req() req: any,
        @Param('classId') classId: string,
        @Param('planId') planId: string,
    ) {
        return this.tutorService.deleteLessonPlan(this.getHubId(req), classId, planId);
    }

    // ===== LESSON RECORDS (진도 기록) =====
    @Post('classes/:classId/lesson-records')
    createLessonRecord(
        @Req() req: any,
        @Param('classId') classId: string,
        @Body() body: {
            lessonPlanId: string; recordDate: string; summary?: string;
            pagesFrom?: number; pagesTo?: number; conceptNote?: string; fileUrl?: string;
        },
    ) {
        return this.tutorService.createLessonRecord(this.getHubId(req), classId, body);
    }

    // ===== ATTENDANCE (출결) =====
    @Post('classes/:classId/attendance')
    bulkCheckAttendance(
        @Req() req: any,
        @Param('classId') classId: string,
        @Body() body: {
            date: string;
            records: Array<{ studentId: string; status: 'present' | 'late' | 'absent'; note?: string }>;
        },
    ) {
        return this.tutorService.bulkCheckAttendance(this.getHubId(req), classId, body);
    }

    @Get('classes/:classId/attendance')
    getAttendance(
        @Req() req: any,
        @Param('classId') classId: string,
        @Query('date') date?: string,
    ) {
        return this.tutorService.getAttendance(this.getHubId(req), classId, date);
    }

    // ===== TESTS =====
    @Post('classes/:classId/tests')
    createTest(
        @Req() req: any,
        @Param('classId') classId: string,
        @Body() body: {
            lessonId: string; title: string; description?: string; testDate?: string; maxScore: number;
        },
    ) {
        return this.tutorService.createTest(this.getHubId(req), classId, body);
    }

    @Post('tests/:testId/results')
    bulkInputTestResults(
        @Req() req: any,
        @Param('testId') testId: string,
        @Body() body: { results: Array<{ studentId: string; score: number; feedback?: string }> },
    ) {
        return this.tutorService.bulkInputTestResults(this.getHubId(req), testId, body.results);
    }

    @Get('tests/:testId/results')
    getTestResults(@Req() req: any, @Param('testId') testId: string) {
        return this.tutorService.getTestResults(this.getHubId(req), testId);
    }

    // ===== ASSIGNMENTS =====
    @Post('classes/:classId/assignments')
    createAssignment(
        @Req() req: any,
        @Param('classId') classId: string,
        @Body() body: {
            lessonId: string; title: string; description?: string; dueDate?: string; fileUrl?: string;
        },
    ) {
        return this.tutorService.createAssignment(this.getHubId(req), classId, body);
    }

    @Get('assignments/:assignmentId/submissions')
    getAssignmentSubmissions(
        @Req() req: any,
        @Param('assignmentId') assignmentId: string,
    ) {
        return this.tutorService.getAssignmentSubmissions(this.getHubId(req), assignmentId);
    }

    @Patch('submissions/:submissionId/grade')
    gradeSubmission(
        @Req() req: any,
        @Param('submissionId') submissionId: string,
        @Body() body: { grade?: number; feedback?: string },
    ) {
        return this.tutorService.gradeSubmission(this.getHubId(req), submissionId, { ...body, status: 'graded' });
    }

    // ===== PRIVATE COMMENTS =====
    @Post('comments')
    createPrivateComment(
        @Req() req: any,
        @Body() body: {
            targetId: string; studentId?: string; contextType?: string;
            contextId?: string; content: string; imageUrl?: string;
        },
    ) {
        return this.tutorService.createPrivateComment(this.getHubId(req), body);
    }

    @Get('comments/:studentId')
    getPrivateComments(@Req() req: any, @Param('studentId') studentId: string) {
        return this.tutorService.getPrivateComments(this.getHubId(req), studentId);
    }
}
