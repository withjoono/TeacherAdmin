/**
 * Planner Rating API
 * StudyPlanner 플래너 조회 + 1~10점 성취도 채점 (선생님앱 → public 스키마 연동)
 */

import { authClient } from './client';

// ===== Types =====

export interface PlannerMission {
    id: number;
    subject: string | null;
    content: string | null;
    startTime: string | null;   // 'HH:mm'
    endTime: string | null;     // 'HH:mm'
    plannedStartPage: number | null;
    plannedEndPage: number | null;
    plannedAmount: number | null;
    status: string;             // pending | fixed | changed | added | deleted | completed
    completed: boolean;
    actualStartPage: number | null;
    actualEndPage: number | null;
    actualAmount: number | null;
    studyMinutes: number | null;
}

export interface PlannerDailyScore {
    date: string;               // 'YYYY-MM-DD'
    totalScore: number;
    missionCount: number;
    studyMinutes: number;
}

export interface StudentPlanner {
    date: string;               // 'YYYY-MM-DD'
    student: {
        id: number;
        name: string;
        grade: string | null;
        schoolName: string | null;
    };
    missions: PlannerMission[];
    summary: {
        totalMissions: number;
        completedMissions: number;
        studyMinutes: number;
        totalPages: number;
    };
    recentScores: PlannerDailyScore[];
}

export interface PlannerRating {
    id: number;
    date: string;               // 'YYYY-MM-DD'
    score: number;              // 1~10
    comment: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePlannerRatingBody {
    date: string;               // 'YYYY-MM-DD'
    score: number;              // 1~10
    comment?: string;
}

// ===== API Functions =====

/** 학생의 특정 날짜 플래너(미션) 조회 */
export async function getStudentPlanner(
    studentId: string,
    date?: string,
): Promise<StudentPlanner> {
    const response = await authClient.get(`/tutor/students/${studentId}/planner`, {
        params: date ? { date } : undefined,
    });
    return response.data;
}

/** 학생의 선생님 채점 이력 조회 */
export async function getPlannerRatings(studentId: string): Promise<PlannerRating[]> {
    const response = await authClient.get(`/tutor/students/${studentId}/planner-ratings`);
    return response.data;
}

/** 1~10점 성취도 점수 + 코멘트 채점 (날짜별 1건, 있으면 갱신) */
export async function createPlannerRating(
    studentId: string,
    body: CreatePlannerRatingBody,
): Promise<PlannerRating> {
    const response = await authClient.post(
        `/tutor/students/${studentId}/planner-ratings`,
        body,
    );
    return response.data;
}
