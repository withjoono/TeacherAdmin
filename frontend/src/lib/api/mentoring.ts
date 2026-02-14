/**
 * Mentoring API
 * 선생님의 반 및 학생 관리 API
 */

import { authClient } from './client';

// ==================== Types ====================

export interface Student {
  id: number;
  name: string;
  email: string;
  grade: number;
  school?: string;
  profileImage?: string;
  classId?: string;
}

export interface Class {
  id: string;
  className: string;
  studentCount: number;
  createdAt: string;
}

export interface InviteCode {
  code: string;
  className: string;
  usageCount: number;
  maxUsage: number;
  expireAt: string;
  isActive: boolean;
  createdAt: string;
}

// ==================== API Functions ====================

/**
 * 반 목록 조회
 */
export const getClasses = async (): Promise<Class[]> => {
  const response = await authClient.get('/mentoring/classes');
  return response.data.data;
};

/**
 * 반 추가
 */
export const addClass = async (className: string): Promise<Class> => {
  const response = await authClient.post('/mentoring/classes', { className });
  return response.data.data;
};

/**
 * 반 삭제
 */
export const deleteClass = async (classId: string): Promise<void> => {
  await authClient.delete('/mentoring/classes', {
    data: { classId },
  });
};

/**
 * 학생 목록 조회
 */
export const getStudents = async (classId?: string): Promise<Student[]> => {
  const params = classId ? { classId } : {};
  const response = await authClient.get('/mentoring/students', { params });
  return response.data.data;
};

/**
 * 학생 추가
 */
export const addStudent = async (studentId: number, classId: string): Promise<Student> => {
  const response = await authClient.post('/mentoring/students', {
    studentId,
    classId,
  });
  return response.data.data;
};

/**
 * 학생 삭제
 */
export const deleteStudent = async (studentId: number): Promise<void> => {
  await authClient.delete(`/mentoring/students/${studentId}`);
};

/**
 * 초대 코드 생성
 */
export const createInvite = async (data: {
  classId: string;
  maxUsage?: number;
  expireDays?: number;
}): Promise<InviteCode> => {
  const response = await authClient.post('/mentoring/invite', data);
  return response.data.data;
};

/**
 * 내 초대 코드 목록 조회
 */
export const getMyInvites = async (): Promise<InviteCode[]> => {
  const response = await authClient.get('/mentoring/invites');
  return response.data.data;
};

/**
 * 초대 코드 비활성화
 */
export const deactivateInvite = async (code: string): Promise<void> => {
  await authClient.delete(`/mentoring/invite/${code}`);
};




























