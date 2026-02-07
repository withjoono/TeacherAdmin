const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4003/api";

interface ApiOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "요청 실패" }));
    throw new ApiError(response.status, error.message || "요청 실패");
  }

  return response.json();
}

// Mock Exam APIs
export const mockExamApi = {
  getAll: (token: string) =>
    request<MockExam[]>("/mock-exams", { token }),

  getById: (id: number, token: string) =>
    request<MockExam>(`/mock-exams/${id}`, { token }),

  getByCode: (code: string, token: string) =>
    request<MockExam>(`/mock-exams/code/${code}`, { token }),

  search: (params: { year?: number; grade?: string; month?: number }, token: string) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request<MockExam[]>(`/mock-exams/search?${query}`, { token });
  },

  getAnswers: (id: number, subject: string, token: string) =>
    request<ExamQuestion[]>(`/mock-exams/${id}/answers?subject=${subject}`, { token }),

  // Admin APIs
  create: (data: CreateMockExamDto, token: string) =>
    request<MockExam>("/admin/mock-exams", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  update: (id: number, data: Partial<CreateMockExamDto>, token: string) =>
    request<MockExam>(`/admin/mock-exams/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: number, token: string) =>
    request<void>(`/admin/mock-exams/${id}`, {
      method: "DELETE",
      token,
    }),

  uploadQuestions: (id: number, questions: CreateQuestionDto[], token: string) =>
    request<{ count: number }>(`/admin/mock-exams/${id}/questions`, {
      method: "POST",
      body: JSON.stringify({ questions }),
      token,
    }),

  grade: (data: GradeAnswersDto, token: string) =>
    request<GradeResult>("/mock-exams/grade", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
};

// Grading APIs
export const gradingApi = {
  submit: (data: SubmitGradingDto, token: string) =>
    request<GradeResult>("/admin/grading/submit", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  getByExam: (examId: number, token: string) =>
    request<StudentScore[]>(`/admin/grading/exam/${examId}`, { token }),

  getByStudent: (studentId: number, token: string) =>
    request<StudentScore[]>(`/admin/grading/student/${studentId}`, { token }),
};

// Auth APIs
export const authApi = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; refreshToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refreshToken: string) =>
    request<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  me: (token: string) =>
    request<User>("/auth/me", { token }),
};

// Types
export interface MockExam {
  id: number;
  code: string;
  name: string;
  grade: string;
  year: number;
  month: number;
  type: "교육청" | "평가원" | "수능";
  questions?: ExamQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface ExamQuestion {
  id: number;
  mockExamId: number;
  subject: string;
  subjectDetail?: string;
  questionNumber: number;
  answer: number;
  score: number;
  difficulty?: number;
  correctRate?: number;
}

export interface CreateMockExamDto {
  code: string;
  name: string;
  grade: string;
  year: number;
  month: number;
  type: "교육청" | "평가원" | "수능";
}

export interface CreateQuestionDto {
  subject: string;
  subjectDetail?: string;
  questionNumber: number;
  answer: number;
  score: number;
  difficulty?: number;
  correctRate?: number;
}

export interface GradeAnswersDto {
  mockExamId: number;
  subject: string;
  subjectDetail?: string;
  answers: { questionNumber: number; answer: number }[];
}

export interface GradeResult {
  mockExamId: number;
  subject: string;
  subjectDetail?: string;
  totalQuestions: number;
  correctCount: number;
  totalScore: number;
  earnedScore: number;
  results: {
    questionNumber: number;
    studentAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    score: number;
    earnedScore: number;
  }[];
}

export interface SubmitGradingDto {
  studentId: number;
  mockExamId: number;
  subject: string;
  subjectDetail?: string;
  answers: { questionNumber: number; answer: number }[];
  saveScore?: boolean;
}

export interface StudentScore {
  id: number;
  studentId: number;
  mockExamId: number;
  koreanRaw?: number;
  mathRaw?: number;
  englishRaw?: number;
  inquiryRaw1?: number;
  inquiryRaw2?: number;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
}
