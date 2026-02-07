export interface MockExam {
  id: number;
  code: string;
  name: string;
  grade: string;
  year: number;
  month: number;
  type: ExamType;
  questions?: ExamQuestion[];
  createdAt: string;
  updatedAt: string;
}

export type ExamType = "교육청" | "평가원" | "수능";

export type Grade = "H1" | "H2" | "H3";

export interface ExamQuestion {
  id: number;
  mockExamId: number;
  subject: Subject;
  subjectDetail?: string;
  questionNumber: number;
  answer: number; // 1-5
  score: number;
  difficulty?: number;
  correctRate?: number;
  choiceRatio1?: number;
  choiceRatio2?: number;
  choiceRatio3?: number;
  choiceRatio4?: number;
  choiceRatio5?: number;
}

export type Subject = "국어" | "수학" | "영어" | "탐구1" | "탐구2" | "한국사";

export interface Student {
  id: number;
  name: string;
  grade: string;
  school: string;
  phone?: string;
  parentPhone?: string;
}

export interface StudentScore {
  id: number;
  studentId: number;
  mockExamId: number;
  koreanSelection?: string;
  mathSelection?: string;
  inquiry1?: string;
  inquiry2?: string;
  koreanRaw?: number;
  mathRaw?: number;
  englishRaw?: number;
  inquiry1Raw?: number;
  inquiry2Raw?: number;
  koreanStandard?: number;
  mathStandard?: number;
  englishGrade?: number;
  inquiry1Standard?: number;
  inquiry2Standard?: number;
  koreanPercentile?: number;
  mathPercentile?: number;
  inquiry1Percentile?: number;
  inquiry2Percentile?: number;
  koreanGrade?: number;
  mathGrade?: number;
  inquiry1Grade?: number;
  inquiry2Grade?: number;
  totalStandardSum?: number;
  totalPercentileSum?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedQuestion {
  questionNumber: number;
  answer: number;
  score: number;
  difficulty?: number;
  correctRate?: number;
  isValid: boolean;
  errors?: string[];
}

export interface GradeResult {
  mockExamId: number;
  subject: string;
  subjectDetail?: string;
  totalQuestions: number;
  correctCount: number;
  totalScore: number;
  earnedScore: number;
  results: QuestionResult[];
}

export interface QuestionResult {
  questionNumber: number;
  studentAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  score: number;
  earnedScore: number;
  difficulty?: number;
  correctRate?: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";
