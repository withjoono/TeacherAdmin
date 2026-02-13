/**
 * TutorBoard Teacher API
 * TutorBoard 백엔드의 Teacher 엔드포인트와 연동
 */

import { authClient } from './client';

// ===== Types =====

export interface DashboardStats {
    totalClasses: number;
    totalStudents: number;
    pendingAssignments: number;
    upcomingExams: number;
    unreadMessages: number;
    todayLessons: any[];
    recentActivities: any[];
}

export interface ClassInfo {
    id: string;
    name: string;
    subject: string;
    studentCount: number;
}

export interface StudentInfo {
    id: string;
    name: string;
    number: number;
    avgScore?: number;
    attendance?: number;
}

export interface LessonPlan {
    id: string;
    classId: string;
    title: string;
    description?: string;
    scheduledDate?: string;
    progress?: number;
    createdAt: string;
    updatedAt: string;
}

export interface LessonRecord {
    id: string;
    classId: string;
    lessonPlanId: string;
    recordDate: string;
    summary?: string;
    pagesFrom?: number;
    pagesTo?: number;
    conceptNote?: string;
    fileUrl?: string;
    createdAt: string;
}

export interface AttendanceRecord {
    studentId: string;
    studentName: string;
    status: 'present' | 'late' | 'absent';
    note?: string;
    checkedInAt?: string;
}

export interface TestInfo {
    id: string;
    classId: string;
    lessonId: string;
    title: string;
    description?: string;
    testDate?: string;
    maxScore: number;
    avgScore?: number;
    submissionCount?: number;
    totalStudents?: number;
}

export interface TestResult {
    studentId: string;
    studentName: string;
    score: number;
    feedback?: string;
}

export interface Assignment {
    id: string;
    classId: string;
    lessonId: string;
    title: string;
    description?: string;
    dueDate?: string;
    fileUrl?: string;
    submissionRate?: number;
    status?: string;
}

export interface PrivateComment {
    id: string;
    authorId: string;
    authorName: string;
    targetId: string;
    studentId?: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
}

// ===== Dashboard =====

export async function getDashboard(): Promise<DashboardStats> {
    const response = await authClient.get('/teacher/dashboard');
    return response.data;
}

// ===== Classes =====

export async function getMyClasses(): Promise<ClassInfo[]> {
    const response = await authClient.get('/teacher/classes');
    return response.data;
}

export async function getClassStudents(classId: string): Promise<StudentInfo[]> {
    const response = await authClient.get(`/teacher/classes/${classId}/students`);
    return response.data;
}

// ===== Lesson Plans =====

export async function getLessonPlans(classId: string): Promise<LessonPlan[]> {
    const response = await authClient.get(`/teacher/classes/${classId}/lesson-plans`);
    return response.data;
}

export async function createLessonPlan(
    classId: string,
    data: { title: string; description?: string; scheduledDate?: string }
): Promise<LessonPlan> {
    const response = await authClient.post(`/teacher/classes/${classId}/lesson-plans`, data);
    return response.data;
}

export async function updateLessonPlan(
    classId: string,
    planId: string,
    data: { title?: string; description?: string; scheduledDate?: string; progress?: number }
): Promise<LessonPlan> {
    const response = await authClient.put(`/teacher/classes/${classId}/lesson-plans/${planId}`, data);
    return response.data;
}

export async function deleteLessonPlan(classId: string, planId: string): Promise<void> {
    await authClient.delete(`/teacher/classes/${classId}/lesson-plans/${planId}`);
}

// ===== Lesson Records =====

export async function createLessonRecord(
    classId: string,
    data: {
        lessonPlanId: string;
        recordDate: string;
        summary?: string;
        pagesFrom?: number;
        pagesTo?: number;
        conceptNote?: string;
        fileUrl?: string;
    }
): Promise<LessonRecord> {
    const response = await authClient.post(`/teacher/classes/${classId}/lesson-records`, data);
    return response.data;
}

// ===== Attendance =====

export async function bulkCheckAttendance(
    classId: string,
    data: {
        date: string;
        records: Array<{ studentId: string; status: 'present' | 'late' | 'absent'; note?: string }>;
    }
): Promise<void> {
    await authClient.post(`/teacher/classes/${classId}/attendance`, data);
}

export async function getAttendance(
    classId: string,
    date?: string
): Promise<AttendanceRecord[]> {
    const params = date ? { date } : {};
    const response = await authClient.get(`/teacher/classes/${classId}/attendance`, { params });
    return response.data;
}

// ===== Tests =====

export async function createTest(
    classId: string,
    data: {
        lessonId: string;
        title: string;
        description?: string;
        testDate?: string;
        maxScore: number;
    }
): Promise<TestInfo> {
    const response = await authClient.post(`/teacher/classes/${classId}/tests`, data);
    return response.data;
}

export async function bulkInputTestResults(
    testId: string,
    results: Array<{ studentId: string; score: number; feedback?: string }>
): Promise<void> {
    await authClient.post(`/teacher/tests/${testId}/results`, { results });
}

export async function getTestResults(testId: string): Promise<TestResult[]> {
    const response = await authClient.get(`/teacher/tests/${testId}/results`);
    return response.data;
}

// ===== Assignments =====

export async function createAssignment(
    classId: string,
    data: {
        lessonId: string;
        title: string;
        description?: string;
        dueDate?: string;
        fileUrl?: string;
    }
): Promise<Assignment> {
    const response = await authClient.post(`/teacher/classes/${classId}/assignments`, data);
    return response.data;
}

export async function getAssignmentSubmissions(assignmentId: string) {
    const response = await authClient.get(`/teacher/assignments/${assignmentId}/submissions`);
    return response.data;
}

export async function gradeSubmission(
    submissionId: string,
    data: { grade?: number; feedback?: string }
) {
    const response = await authClient.patch(`/teacher/submissions/${submissionId}/grade`, data);
    return response.data;
}

// ===== Private Comments =====

export async function createPrivateComment(data: {
    targetId: string;
    studentId?: string;
    contextType?: string;
    contextId?: string;
    content: string;
    imageUrl?: string;
}): Promise<PrivateComment> {
    const response = await authClient.post('/teacher/comments', data);
    return response.data;
}

export async function getPrivateComments(studentId: string): Promise<PrivateComment[]> {
    const response = await authClient.get(`/teacher/comments/${studentId}`);
    return response.data;
}
