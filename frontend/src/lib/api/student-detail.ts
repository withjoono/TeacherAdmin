/**
 * Student Detail API
 * teacher-frontend의 useStudentDetail hooks를 frontend용 authClient 기반으로 이식
 */

import { authClient } from './client';

// ===== Types =====

export interface StudentOverview {
    student: {
        id: string;
        username: string;
        email: string;
        phone?: string;
        avatarUrl?: string;
    };
    classes: {
        id: string;
        name: string;
        subject: string;
    }[];
    stats: {
        assignments: { total: number; submitted: number };
        tests: {
            count: number;
            avgScore: number | null;
            recentResults: {
                id: string;
                score: number;
                feedback?: string;
                takenAt: string;
                test: { maxScore: number; title: string };
            }[];
        };
        attendance: {
            total: number;
            present: number;
            late: number;
            absent: number;
        };
        commentCount: number;
    };
}

export interface StudentAssignment {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    createdAt: string;
    lesson: {
        title: string;
        class: { name: string; subject: string };
    };
    submissions: {
        id: string;
        status: 'pending' | 'submitted' | 'graded';
        grade?: number;
        feedback?: string;
        submittedAt: string;
        submissionFileUrl?: string;
    }[];
}

export interface StudentTest {
    id: string;
    title: string;
    description?: string;
    testDate?: string;
    maxScore: number;
    createdAt: string;
    lesson: {
        title: string;
        class: { name: string; subject: string };
    };
    results: {
        id: string;
        score: number;
        feedback?: string;
        wrongAnswerNote?: string;
        takenAt: string;
    }[];
}

export interface StudentAttendanceRecord {
    id: string;
    date: string;
    status: 'present' | 'late' | 'absent';
    note?: string;
    class: { name: string; subject: string };
}

export interface StudentPrivateComment {
    id: string;
    content: string;
    contextType?: string;
    contextId?: string;
    imageUrl?: string;
    createdAt: string;
    author: {
        id: string;
        username: string;
        role: string;
        avatarUrl?: string;
    };
    target: {
        id: string;
        username: string;
        role: string;
    };
}

// ===== API Functions =====

export async function getStudentOverview(studentId: string): Promise<StudentOverview> {
    const response = await authClient.get(`/tutor/students/${studentId}/overview`);
    return response.data;
}

export async function getStudentAssignments(studentId: string): Promise<StudentAssignment[]> {
    const response = await authClient.get(`/tutor/students/${studentId}/assignments`);
    return response.data;
}

export async function getStudentTests(studentId: string): Promise<StudentTest[]> {
    const response = await authClient.get(`/tutor/students/${studentId}/tests`);
    return response.data;
}

export async function getStudentAttendance(studentId: string): Promise<StudentAttendanceRecord[]> {
    const response = await authClient.get(`/tutor/students/${studentId}/attendance`);
    return response.data;
}

export async function getStudentComments(studentId: string): Promise<StudentPrivateComment[]> {
    const response = await authClient.get(`/tutor/comments/${studentId}`);
    return response.data;
}

export async function createStudentComment(body: {
    targetId: string;
    studentId?: string;
    contextType?: string;
    contextId?: string;
    content: string;
}): Promise<StudentPrivateComment> {
    const response = await authClient.post('/tutor/comments', body);
    return response.data;
}
