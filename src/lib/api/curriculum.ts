/**
 * Curriculum API
 * 수업 진도 및 과제 관리 API
 */

import { authClient } from './client';

// ==================== Types ====================

export interface LessonPlan {
  id: number;
  classId: string;
  title: string;
  description?: string;
  subject: string;
  scheduledDate: string;
  progress: number;        // 0-100
  week: number;
  status: '예정' | '진행중' | '완료';
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: number;
  classId: string;
  lessonPlanId?: number;
  title: string;
  description?: string;
  subject: string;
  dueDate: string;
  fileUrl?: string;
  submissionCount: number;
  totalStudents: number;
  avgScore?: number;
  status: '예정' | '진행중' | '완료';
  createdAt: string;
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  studentId: number;
  studentName: string;
  submissionFileUrl?: string;
  feedback?: string;
  grade?: number;
  submittedAt: string;
}

export interface CreateLessonPlanDto {
  classId: string;
  title: string;
  description?: string;
  subject: string;
  scheduledDate: string;
  week: number;
}

export interface UpdateLessonPlanDto {
  title?: string;
  description?: string;
  subject?: string;
  scheduledDate?: string;
  progress?: number;
  status?: '예정' | '진행중' | '완료';
}

export interface CreateAssignmentDto {
  classId: string;
  lessonPlanId?: number;
  title: string;
  description?: string;
  subject: string;
  dueDate: string;
}

export interface UpdateAssignmentDto {
  title?: string;
  description?: string;
  subject?: string;
  dueDate?: string;
}

// ==================== Mock 데이터 ====================

const mockLessonPlans: Record<string, LessonPlan[]> = {
  'class-a': [
    { id: 1, classId: 'class-a', title: '이차방정식', description: '이차방정식의 풀이법과 활용', subject: '수학', scheduledDate: '2025-03-03', progress: 100, week: 1, status: '완료', createdAt: '2025-02-20', updatedAt: '2025-03-03' },
    { id: 2, classId: 'class-a', title: '이차함수', description: '이차함수의 그래프와 성질', subject: '수학', scheduledDate: '2025-03-10', progress: 95, week: 2, status: '완료', createdAt: '2025-02-20', updatedAt: '2025-03-10' },
    { id: 3, classId: 'class-a', title: '도형의 성질', description: '삼각형과 사각형의 성질', subject: '수학', scheduledDate: '2025-03-17', progress: 60, week: 3, status: '진행중', createdAt: '2025-02-20', updatedAt: '2025-03-17' },
    { id: 4, classId: 'class-a', title: '삼각함수', description: '삼각함수의 정의와 그래프', subject: '수학', scheduledDate: '2025-03-24', progress: 0, week: 4, status: '예정', createdAt: '2025-02-20', updatedAt: '2025-02-20' },
    { id: 5, classId: 'class-a', title: '수열', description: '등차수열과 등비수열', subject: '수학', scheduledDate: '2025-03-31', progress: 0, week: 5, status: '예정', createdAt: '2025-02-20', updatedAt: '2025-02-20' },
  ],
  'class-b': [
    { id: 6, classId: 'class-b', title: '문법 기초', description: '영어 기본 문법 복습', subject: '영어', scheduledDate: '2025-03-03', progress: 100, week: 1, status: '완료', createdAt: '2025-02-20', updatedAt: '2025-03-03' },
    { id: 7, classId: 'class-b', title: '독해 연습', description: '영어 지문 독해 전략', subject: '영어', scheduledDate: '2025-03-10', progress: 70, week: 2, status: '진행중', createdAt: '2025-02-20', updatedAt: '2025-03-10' },
    { id: 8, classId: 'class-b', title: '듣기 평가 대비', description: '영어 듣기 실전 연습', subject: '영어', scheduledDate: '2025-03-17', progress: 0, week: 3, status: '예정', createdAt: '2025-02-20', updatedAt: '2025-02-20' },
  ],
  'class-c': [
    { id: 9, classId: 'class-c', title: '현대 소설', description: '한국 현대 소설 분석', subject: '국어', scheduledDate: '2025-03-03', progress: 100, week: 1, status: '완료', createdAt: '2025-02-20', updatedAt: '2025-03-03' },
    { id: 10, classId: 'class-c', title: '고전 문학', description: '고전 시가 감상', subject: '국어', scheduledDate: '2025-03-10', progress: 40, week: 2, status: '진행중', createdAt: '2025-02-20', updatedAt: '2025-03-10' },
  ],
};

const mockAssignments: Record<string, Assignment[]> = {
  'class-a': [
    { id: 1, classId: 'class-a', title: '이차방정식 연습문제', description: '교재 p.45~p.52 풀기', subject: '수학', dueDate: '2025-03-20', submissionCount: 10, totalStudents: 12, avgScore: 85.5, status: '진행중', createdAt: '2025-03-05' },
    { id: 2, classId: 'class-a', title: '이차함수 그래프 그리기', description: '그래프 5개 그려서 제출', subject: '수학', dueDate: '2025-03-25', submissionCount: 7, totalStudents: 12, avgScore: undefined, status: '진행중', createdAt: '2025-03-12' },
    { id: 3, classId: 'class-a', title: '단원평가 대비 정리', description: '1~2주차 내용 정리노트', subject: '수학', dueDate: '2025-03-15', submissionCount: 12, totalStudents: 12, avgScore: 92.3, status: '완료', createdAt: '2025-03-01' },
  ],
  'class-b': [
    { id: 4, classId: 'class-b', title: '영어 에세이 작성', description: 'My Favorite Book 주제 200단어', subject: '영어', dueDate: '2025-03-22', submissionCount: 8, totalStudents: 15, avgScore: undefined, status: '진행중', createdAt: '2025-03-10' },
    { id: 5, classId: 'class-b', title: '문법 워크시트', description: '시제 연습문제 풀기', subject: '영어', dueDate: '2025-03-18', submissionCount: 15, totalStudents: 15, avgScore: 78.2, status: '완료', createdAt: '2025-03-05' },
  ],
  'class-c': [
    { id: 6, classId: 'class-c', title: '소설 감상문', description: '현대 소설 감상문 A4 1장', subject: '국어', dueDate: '2025-03-20', submissionCount: 5, totalStudents: 11, avgScore: undefined, status: '진행중', createdAt: '2025-03-08' },
  ],
};

const mockSubmissions: Record<number, AssignmentSubmission[]> = {
  1: [
    { id: 1, assignmentId: 1, studentId: 1, studentName: '김철수', grade: 90, submittedAt: '2025-03-18', feedback: '잘했습니다' },
    { id: 2, assignmentId: 1, studentId: 2, studentName: '이영희', grade: 95, submittedAt: '2025-03-17' },
    { id: 3, assignmentId: 1, studentId: 3, studentName: '박민수', grade: 78, submittedAt: '2025-03-19', feedback: '풀이 과정을 더 자세히 써주세요' },
  ],
  3: [
    { id: 4, assignmentId: 3, studentId: 1, studentName: '김철수', grade: 92, submittedAt: '2025-03-14' },
    { id: 5, assignmentId: 3, studentId: 2, studentName: '이영희', grade: 98, submittedAt: '2025-03-13' },
    { id: 6, assignmentId: 3, studentId: 3, studentName: '박민수', grade: 87, submittedAt: '2025-03-15' },
  ],
};

// ==================== API Functions ====================
// TODO: 백엔드 연동 시 Mock → 실 API 전환

let nextLessonId = 100;
let nextAssignmentId = 100;

/**
 * 수업 진도 목록 조회
 */
export const getLessonPlans = async (classId: string): Promise<LessonPlan[]> => {
  // Mock: 로컬 데이터 반환
  await delay(300);
  return mockLessonPlans[classId] || [];
  // 실 API:
  // const response = await authClient.get('/curriculum/lesson-plans', { params: { classId } });
  // return response.data.data;
};

/**
 * 수업 계획 추가
 */
export const createLessonPlan = async (data: CreateLessonPlanDto): Promise<LessonPlan> => {
  await delay(300);
  const newPlan: LessonPlan = {
    id: nextLessonId++,
    ...data,
    progress: 0,
    status: '예정',
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  };
  if (!mockLessonPlans[data.classId]) {
    mockLessonPlans[data.classId] = [];
  }
  mockLessonPlans[data.classId].push(newPlan);
  return newPlan;
  // 실 API:
  // const response = await authClient.post('/curriculum/lesson-plans', data);
  // return response.data.data;
};

/**
 * 수업 진도 업데이트
 */
export const updateLessonPlan = async (id: number, classId: string, data: UpdateLessonPlanDto): Promise<LessonPlan> => {
  await delay(300);
  const plans = mockLessonPlans[classId] || [];
  const idx = plans.findIndex(p => p.id === id);
  if (idx >= 0) {
    plans[idx] = { ...plans[idx], ...data, updatedAt: new Date().toISOString().split('T')[0] };
    // Auto-set status from progress
    if (data.progress !== undefined) {
      if (data.progress >= 100) plans[idx].status = '완료';
      else if (data.progress > 0) plans[idx].status = '진행중';
      else plans[idx].status = '예정';
    }
    return plans[idx];
  }
  throw new Error('Not found');
  // 실 API:
  // const response = await authClient.patch(`/curriculum/lesson-plans/${id}`, data);
  // return response.data.data;
};

/**
 * 수업 계획 삭제
 */
export const deleteLessonPlan = async (id: number, classId: string): Promise<void> => {
  await delay(300);
  const plans = mockLessonPlans[classId] || [];
  const idx = plans.findIndex(p => p.id === id);
  if (idx >= 0) plans.splice(idx, 1);
  // 실 API:
  // await authClient.delete(`/curriculum/lesson-plans/${id}`);
};

/**
 * 과제 목록 조회
 */
export const getAssignments = async (classId: string): Promise<Assignment[]> => {
  await delay(300);
  return mockAssignments[classId] || [];
  // 실 API:
  // const response = await authClient.get('/curriculum/assignments', { params: { classId } });
  // return response.data.data;
};

/**
 * 과제 추가
 */
export const createAssignment = async (data: CreateAssignmentDto): Promise<Assignment> => {
  await delay(300);
  const newAssignment: Assignment = {
    id: nextAssignmentId++,
    ...data,
    submissionCount: 0,
    totalStudents: 12,
    status: '예정',
    createdAt: new Date().toISOString().split('T')[0],
  };
  if (!mockAssignments[data.classId]) {
    mockAssignments[data.classId] = [];
  }
  mockAssignments[data.classId].push(newAssignment);
  return newAssignment;
  // 실 API:
  // const response = await authClient.post('/curriculum/assignments', data);
  // return response.data.data;
};

/**
 * 과제 삭제
 */
export const deleteAssignment = async (id: number, classId: string): Promise<void> => {
  await delay(300);
  const assignments = mockAssignments[classId] || [];
  const idx = assignments.findIndex(a => a.id === id);
  if (idx >= 0) assignments.splice(idx, 1);
  // 실 API:
  // await authClient.delete(`/curriculum/assignments/${id}`);
};

/**
 * 과제 제출 현황 조회
 */
export const getSubmissions = async (assignmentId: number): Promise<AssignmentSubmission[]> => {
  await delay(300);
  return mockSubmissions[assignmentId] || [];
  // 실 API:
  // const response = await authClient.get(`/curriculum/assignments/${assignmentId}/submissions`);
  // return response.data.data;
};

// ==================== Utility ====================

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
