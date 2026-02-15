/**
 * Classes API (Arena 기반)
 * Teacher Admin 자체 백엔드(NestJS)와 연동
 */

import { authClient } from './client';

// ===== Types =====

export interface ArenaClass {
    id: number;
    arenaCode: string;
    name: string;
    description: string | null;
    inviteCode: string;
    memberCount: number;
    createdAt: string;
}

export interface ImportStudentsResult {
    registered: {
        count: number;
        ids: string[];
    };
    alreadyRegistered: {
        count: number;
        ids: string[];
    };
    notFound: {
        count: number;
        ids: string[];
        message: string | null;
    };
}

export interface ClassStatsSummary {
    totalMembers: number;
    activeMembers: number;
    totalStudyMin: number;
    avgStudyMinPerMember: number;
}

export interface ChartDataPoint {
    date: string;
    totalStudyMin: number;
    memberCount: number;
}

export interface MemberStat {
    memberId: number;
    authMemberId: string | null;
    totalStudyMin: number;
    avgStudyMin: number;
    activeDays: number;
}

export interface ClassStats {
    arenaId: number;
    arenaName: string;
    period: 'daily' | 'weekly' | 'monthly';
    summary: ClassStatsSummary;
    chartData: ChartDataPoint[];
    memberStats: MemberStat[];
}

export interface ClassMember {
    memberId: number;
    authMemberId: string | null;
    nickname: string;
    email: string;
    role: string;
    joinedAt: string;
    isActive: boolean;
}

// ===== API Functions =====

/**
 * 새 클래스 생성
 */
export async function createArenaClass(data: {
    name: string;
    description?: string;
}): Promise<ArenaClass> {
    const response = await authClient.post('/api/classes', data);
    return response.data;
}

/**
 * 내 클래스 목록 조회
 */
export async function getMyArenaClasses(): Promise<ArenaClass[]> {
    const response = await authClient.get('/api/classes');
    return response.data;
}

/**
 * 학생 일괄 등록
 */
export async function importStudentsToClass(
    classId: number,
    studentIds: string[]
): Promise<ImportStudentsResult> {
    const response = await authClient.post(`/api/classes/${classId}/students`, {
        studentIds,
    });
    return response.data;
}

/**
 * 클래스 학습량 통계
 */
export async function getClassStats(
    classId: number,
    period: 'daily' | 'weekly' | 'monthly' = 'weekly'
): Promise<ClassStats> {
    const response = await authClient.get(`/api/classes/${classId}/stats`, {
        params: { period },
    });
    return response.data;
}

/**
 * 클래스 멤버 목록
 */
export async function getClassMembers(
    classId: number
): Promise<ClassMember[]> {
    const response = await authClient.get(`/api/classes/${classId}/members`);
    return response.data;
}
