import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi } from '../lib/api';

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

export interface PrivateComment {
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

// ===== Hooks =====

export function useStudentOverview(studentId: string) {
    return useQuery({
        queryKey: ['student-overview', studentId],
        queryFn: async () => {
            const { data } = await teacherApi.get<StudentOverview>(
                `/tutor/students/${studentId}/overview`,
            );
            return data;
        },
        enabled: !!studentId,
    });
}

export function useStudentAssignments(studentId: string) {
    return useQuery({
        queryKey: ['student-assignments', studentId],
        queryFn: async () => {
            const { data } = await teacherApi.get<StudentAssignment[]>(
                `/tutor/students/${studentId}/assignments`,
            );
            return data;
        },
        enabled: !!studentId,
    });
}

export function useStudentTests(studentId: string) {
    return useQuery({
        queryKey: ['student-tests', studentId],
        queryFn: async () => {
            const { data } = await teacherApi.get<StudentTest[]>(
                `/tutor/students/${studentId}/tests`,
            );
            return data;
        },
        enabled: !!studentId,
    });
}

export function useStudentAttendance(studentId: string) {
    return useQuery({
        queryKey: ['student-attendance', studentId],
        queryFn: async () => {
            const { data } = await teacherApi.get<StudentAttendanceRecord[]>(
                `/tutor/students/${studentId}/attendance`,
            );
            return data;
        },
        enabled: !!studentId,
    });
}

export function useStudentComments(studentId: string) {
    return useQuery({
        queryKey: ['student-comments', studentId],
        queryFn: async () => {
            const { data } = await teacherApi.get<PrivateComment[]>(
                `/tutor/comments/${studentId}`,
            );
            return data;
        },
        enabled: !!studentId,
    });
}

export function useCreateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: {
            targetId: string;
            studentId?: string;
            contextType?: string;
            contextId?: string;
            content: string;
        }) => {
            const { data } = await teacherApi.post<PrivateComment>(
                '/tutor/comments',
                body,
            );
            return data;
        },
        onSuccess: (_data, variables) => {
            if (variables.studentId) {
                queryClient.invalidateQueries({
                    queryKey: ['student-comments', variables.studentId],
                });
                queryClient.invalidateQueries({
                    queryKey: ['student-overview', variables.studentId],
                });
            }
        },
    });
}
