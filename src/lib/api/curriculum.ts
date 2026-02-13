/**
 * 수업 현황 API
 * TutorBoard 백엔드의 Teacher 엔드포인트 활용
 */

import { authClient } from './client';

// ===== Types =====

export interface LessonRecord {
  id: number;
  classId: string;
  date: string;
  dayOfWeek: string;
  time: string;
  content: string;
  assignmentResult?: string;
  nextAssignment?: string;
  testResult?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentLessonRecord {
  studentId: string;
  studentName: string;
  attendance: '출석' | '결석' | '지각';
  homework: '완료' | '미완료' | '부분완료';
  testScore: number | null;
  note: string;
}

export interface LessonComment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

export interface CreateLessonRecordData {
  classId: string;
  date: string;
  dayOfWeek: string;
  time: string;
  content: string;
  assignmentResult?: string;
  nextAssignment?: string;
  testResult?: string;
}

// ===== API Functions =====

/**
 * 반별 학생 목록 조회
 */
export async function getClassStudents(classId: string) {
  const response = await authClient.get(`/teacher/classes/${classId}/students`);
  return response.data;
}

/**
 * 수업 기록 목록 조회 (수업 계획 기반)
 */
export async function getLessonRecords(classId: string): Promise<LessonRecord[]> {
  const response = await authClient.get(`/teacher/classes/${classId}/lesson-plans`);
  const plans = response.data;
  // Map lesson plans to LessonRecord format for UI compatibility
  return (plans || []).map((plan: any, idx: number) => ({
    id: plan.id || idx + 1,
    classId,
    date: plan.scheduledDate || plan.createdAt?.split('T')[0] || '',
    dayOfWeek: getDayOfWeek(plan.scheduledDate || plan.createdAt),
    time: '',
    content: plan.description || plan.title || '',
    assignmentResult: '',
    nextAssignment: '',
    testResult: '',
    createdAt: plan.createdAt || '',
    updatedAt: plan.updatedAt || plan.createdAt || '',
  })).sort((a: LessonRecord, b: LessonRecord) => b.date.localeCompare(a.date));
}

/**
 * 수업 기록 추가
 */
export async function createLessonRecord(data: CreateLessonRecordData): Promise<LessonRecord> {
  const response = await authClient.post(`/teacher/classes/${data.classId}/lesson-plans`, {
    title: data.content.substring(0, 50),
    description: data.content,
    scheduledDate: data.date,
  });
  const plan = response.data;
  return {
    id: plan.id,
    classId: data.classId,
    date: data.date,
    dayOfWeek: data.dayOfWeek,
    time: data.time,
    content: data.content,
    assignmentResult: data.assignmentResult,
    nextAssignment: data.nextAssignment,
    testResult: data.testResult,
    createdAt: plan.createdAt || new Date().toISOString(),
    updatedAt: plan.updatedAt || new Date().toISOString(),
  };
}

/**
 * 수업 기록 수정
 */
export async function updateLessonRecord(
  id: number,
  classId: string,
  data: Partial<CreateLessonRecordData>
): Promise<LessonRecord> {
  const response = await authClient.put(`/teacher/classes/${classId}/lesson-plans/${id}`, {
    title: data.content?.substring(0, 50),
    description: data.content,
    scheduledDate: data.date,
  });
  return response.data;
}

/**
 * 수업 기록 삭제
 */
export async function deleteLessonRecord(id: number, classId: string): Promise<void> {
  await authClient.delete(`/teacher/classes/${classId}/lesson-plans/${id}`);
}

/**
 * 출석/학생 기록 조회
 */
export async function getStudentRecords(classId: string, date?: string): Promise<StudentLessonRecord[]> {
  const params = date ? { date } : {};
  const response = await authClient.get(`/teacher/classes/${classId}/attendance`, { params });
  const records = response.data;
  return (records || []).map((r: any) => ({
    studentId: r.studentId,
    studentName: r.studentName || r.student?.name || '',
    attendance: mapAttendanceStatus(r.status),
    homework: '완료',
    testScore: null,
    note: r.note || '',
  }));
}

/**
 * 출석 일괄 저장
 */
export async function updateStudentRecords(
  classId: string,
  date: string,
  updates: Array<{ studentId: string; status: 'present' | 'late' | 'absent'; note?: string }>
): Promise<void> {
  await authClient.post(`/teacher/classes/${classId}/attendance`, {
    date,
    records: updates,
  });
}

/**
 * 코멘트 조회
 */
export async function getComments(studentId: string): Promise<LessonComment[]> {
  const response = await authClient.get(`/teacher/comments/${studentId}`);
  return (response.data || []).map((c: any) => ({
    id: c.id,
    author: c.authorName || '선생님',
    content: c.content,
    createdAt: c.createdAt,
  }));
}

/**
 * 코멘트 추가
 */
export async function addComment(studentId: string, message: string): Promise<LessonComment> {
  const response = await authClient.post('/teacher/comments', {
    targetId: studentId,
    studentId,
    content: message,
  });
  return {
    id: response.data.id,
    author: '선생님',
    content: message,
    createdAt: new Date().toISOString(),
  };
}

// ===== Helpers =====

function getDayOfWeek(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return days[date.getDay()];
  } catch {
    return '';
  }
}

function mapAttendanceStatus(status: string): '출석' | '결석' | '지각' {
  switch (status) {
    case 'present': return '출석';
    case 'absent': return '결석';
    case 'late': return '지각';
    default: return '출석';
  }
}
