/**
 * Teacher Exam API — ExamHub 백엔드의 선생님 출제 시험 엔드포인트 연동
 */
import axios from 'axios';
import { config } from '../config';
import { tokenManager } from './client';

/** ExamHub 백엔드 클라이언트 (Hub SSO 토큰 공유) */
const examhubClient = axios.create({
  baseURL: config.examhubApiUrl,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

examhubClient.interceptors.request.use((req) => {
  const token = tokenManager.getAccessToken();
  if (token && req.headers) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ===== Types =====

export type QuestionType = 'objective' | 'short' | 'essay';

export interface TeacherExamQuestion {
  id?: number;
  questionNumber: number;
  questionType: QuestionType;
  score: number;
  answer?: number | null;
  answerText?: string | null;
  choiceCount?: number;
}

export interface TeacherExamListItem {
  id: number;
  name: string;
  grade: string | null;
  status: string;
  totalQuestions: number;
  submissionCount: number;
  targetClassId: string | null;
  dueDate: string | null;
  createdAt: string;
}

export interface TeacherExamDetail {
  id: number;
  code: string;
  name: string;
  grade: string | null;
  status: string;
  targetClassId: string | null;
  totalQuestions: number | null;
  dueDate: string | null;
  subject: string | null;
  createdAt: string;
  questions: TeacherExamQuestion[];
}

export interface CreateTeacherExamBody {
  name: string;
  grade?: string;
  subject?: string;
  targetClassId?: string;
  dueDate?: string;
  status?: 'draft' | 'published';
  questions: TeacherExamQuestion[];
}

// ===== API =====

export async function listTeacherExams(): Promise<TeacherExamListItem[]> {
  const res = await examhubClient.get('/api/teacher-exams');
  return res.data;
}

export async function getTeacherExam(id: number): Promise<TeacherExamDetail> {
  const res = await examhubClient.get(`/api/teacher-exams/${id}`);
  return res.data;
}

export async function createTeacherExam(
  body: CreateTeacherExamBody,
): Promise<TeacherExamDetail> {
  const res = await examhubClient.post('/api/teacher-exams', body);
  return res.data;
}

export async function updateTeacherExam(
  id: number,
  body: CreateTeacherExamBody,
): Promise<TeacherExamDetail> {
  const res = await examhubClient.put(`/api/teacher-exams/${id}`, body);
  return res.data;
}

export async function setTeacherExamStatus(
  id: number,
  status: 'draft' | 'published' | 'closed',
): Promise<TeacherExamDetail> {
  const res = await examhubClient.patch(`/api/teacher-exams/${id}/status`, { status });
  return res.data;
}

export async function deleteTeacherExam(id: number): Promise<void> {
  await examhubClient.delete(`/api/teacher-exams/${id}`);
}

// ===== 채점 (Phase 3) =====

export interface PendingGradingItem {
  submissionId: number;
  examId: number;
  examName: string;
  studentName: string;
  ungradedCount: number;
  submittedAt: string;
}

export interface SubmissionAnswer {
  id: number;
  questionNumber: number;
  questionType: QuestionType;
  maxScore: number;
  earnedScore: number;
  isGraded: boolean;
  isCorrect: boolean;
  selectedAnswer: number | null;
  answerText: string | null;
  correctAnswer: number | null;
  correctAnswerText: string | null;
}

export interface SubmissionDetail {
  id: number;
  examName: string;
  studentName: string;
  status: string;
  totalScore: number;
  earnedScore: number;
  correctCount: number;
  answers: SubmissionAnswer[];
}

/** 주관식 채점 대기 목록 */
export async function getPendingGrading(): Promise<PendingGradingItem[]> {
  const res = await examhubClient.get('/api/teacher-exams/grading/pending');
  return res.data;
}

/** 제출 상세 (채점용) */
export async function getSubmissionDetail(
  submissionId: number,
): Promise<SubmissionDetail> {
  const res = await examhubClient.get(
    `/api/teacher-exams/submissions/${submissionId}`,
  );
  return res.data;
}

/** 주관식 답안 채점 */
export async function gradeAnswer(
  answerId: number,
  earnedScore: number,
): Promise<{ success: boolean; earnedScore: number }> {
  const res = await examhubClient.patch(
    `/api/teacher-exams/answers/${answerId}/grade`,
    { earnedScore },
  );
  return res.data;
}

/** 학생 시험 제출 + 자동채점 (학생앱에서 사용) */
export async function submitExam(
  examId: number,
  answers: { questionNumber: number; selectedAnswer?: number; answerText?: string }[],
): Promise<{
  submissionId: number;
  status: string;
  earnedScore: number;
  totalScore: number;
  correctCount: number;
  totalQuestions: number;
  pendingManualGrading: boolean;
}> {
  const res = await examhubClient.post(`/api/teacher-exams/${examId}/submit`, {
    answers,
  });
  return res.data;
}
