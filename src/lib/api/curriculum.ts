/**
 * Curriculum API
 * 수업 기록(세션) 및 코멘트 관리 API
 */

// ==================== Types ====================

/** 출석 상태 */
export type AttendanceStatus = '출석' | '지각' | '결석' | '미입력';

/** 수업 기록 (세션 단위) — 반 전체 공통 */
export interface LessonRecord {
  id: number;
  classId: string;
  date: string;           // 날짜 YYYY-MM-DD
  dayOfWeek: string;      // 요일
  time: string;           // 시간 예: "14:00~16:00"
  content: string;        // 수업내용
  assignmentResult?: string; // 과제 결과
  nextAssignment?: string;   // 다음 과제
  testResult?: string;       // 테스트 결과
  createdAt: string;
  updatedAt: string;
}

/** 학생별 출석/개별 정보 */
export interface StudentLessonRecord {
  id: number;
  lessonRecordId: number;
  studentId: number;
  studentName: string;
  attendance: AttendanceStatus;
  // 개별 수정 가능 필드
  date?: string;
  time?: string;
  content?: string;
  nextAssignment?: string;
}

/** 코멘트 (말풍선 형식) */
export interface LessonComment {
  id: number;
  lessonRecordId: number;
  authorId: number;
  authorName: string;
  authorRole: '선생님' | '학부모' | '학생';
  message: string;
  createdAt: string;
}

/** 수업 기록 생성 DTO */
export interface CreateLessonRecordDto {
  classId: string;
  date: string;
  time: string;
  content: string;
  assignmentResult?: string;
  nextAssignment?: string;
  testResult?: string;
}

/** 수업 기록 수정 DTO */
export interface UpdateLessonRecordDto {
  date?: string;
  time?: string;
  content?: string;
  assignmentResult?: string;
  nextAssignment?: string;
  testResult?: string;
}

/** 학생 개별 수정 DTO */
export interface UpdateStudentRecordDto {
  attendance?: AttendanceStatus;
  date?: string;
  time?: string;
  content?: string;
  nextAssignment?: string;
}

// ==================== Mock 데이터 ====================

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function getDayOfWeek(dateStr: string): string {
  return DAY_NAMES[new Date(dateStr).getDay()] + '요일';
}

const mockStudentsByClass: Record<string, { id: number; name: string }[]> = {
  'class-a': [
    { id: 1, name: '김철수' }, { id: 2, name: '이영희' }, { id: 3, name: '박민수' },
    { id: 4, name: '정수현' }, { id: 5, name: '최동현' },
  ],
  'class-b': [
    { id: 6, name: '한지원' }, { id: 7, name: '강민재' }, { id: 8, name: '윤서연' },
  ],
  'class-c': [
    { id: 9, name: '송예진' }, { id: 10, name: '조민서' },
  ],
};

const mockLessonRecords: Record<string, LessonRecord[]> = {
  'class-a': [
    {
      id: 1, classId: 'class-a', date: '2025-03-03', dayOfWeek: '월요일', time: '14:00~16:00',
      content: '이차방정식의 근의 공식과 판별식\n- 근의 공식 유도\n- 판별식 D의 의미\n- 실근, 중근, 허근 판별',
      assignmentResult: '지난 과제 평균 85점, 전원 제출', nextAssignment: '교재 p.45~52 이차방정식 연습문제',
      testResult: '쪽지시험 평균 78점', createdAt: '2025-03-03', updatedAt: '2025-03-03',
    },
    {
      id: 2, classId: 'class-a', date: '2025-03-10', dayOfWeek: '월요일', time: '14:00~16:00',
      content: '이차함수의 그래프\n- 표준형, 일반형 변환\n- 꼭짓점, 축, 개형\n- 최댓값/최솟값',
      assignmentResult: '과제 제출 4/5명, 평균 82점', nextAssignment: '이차함수 그래프 그리기 5문항',
      testResult: undefined, createdAt: '2025-03-10', updatedAt: '2025-03-10',
    },
    {
      id: 3, classId: 'class-a', date: '2025-03-17', dayOfWeek: '월요일', time: '14:00~16:00',
      content: '도형의 성질 — 삼각형의 닮음\n- AA 닮음, SAS 닮음, SSS 닮음\n- 닮음비와 넓이비',
      assignmentResult: undefined, nextAssignment: '삼각형 닮음 증명 3문항',
      testResult: undefined, createdAt: '2025-03-17', updatedAt: '2025-03-17',
    },
  ],
  'class-b': [
    {
      id: 4, classId: 'class-b', date: '2025-03-04', dayOfWeek: '화요일', time: '16:00~18:00',
      content: '영어 문법 — 시제 복습\n- 현재/과거/미래 시제\n- 진행형, 완료형',
      assignmentResult: '전원 제출, 평균 88점', nextAssignment: 'Worksheet: Tense Practice',
      testResult: '단어 시험 평균 92점', createdAt: '2025-03-04', updatedAt: '2025-03-04',
    },
  ],
};

const mockStudentRecords: Record<number, StudentLessonRecord[]> = {
  1: [
    { id: 1, lessonRecordId: 1, studentId: 1, studentName: '김철수', attendance: '출석' },
    { id: 2, lessonRecordId: 1, studentId: 2, studentName: '이영희', attendance: '출석' },
    { id: 3, lessonRecordId: 1, studentId: 3, studentName: '박민수', attendance: '지각' },
    { id: 4, lessonRecordId: 1, studentId: 4, studentName: '정수현', attendance: '출석' },
    { id: 5, lessonRecordId: 1, studentId: 5, studentName: '최동현', attendance: '결석' },
  ],
  2: [
    { id: 6, lessonRecordId: 2, studentId: 1, studentName: '김철수', attendance: '출석' },
    { id: 7, lessonRecordId: 2, studentId: 2, studentName: '이영희', attendance: '출석' },
    { id: 8, lessonRecordId: 2, studentId: 3, studentName: '박민수', attendance: '출석' },
    { id: 9, lessonRecordId: 2, studentId: 4, studentName: '정수현', attendance: '지각' },
    { id: 10, lessonRecordId: 2, studentId: 5, studentName: '최동현', attendance: '출석' },
  ],
  3: [
    { id: 11, lessonRecordId: 3, studentId: 1, studentName: '김철수', attendance: '출석' },
    { id: 12, lessonRecordId: 3, studentId: 2, studentName: '이영희', attendance: '출석' },
    { id: 13, lessonRecordId: 3, studentId: 3, studentName: '박민수', attendance: '출석' },
    { id: 14, lessonRecordId: 3, studentId: 4, studentName: '정수현', attendance: '출석' },
    { id: 15, lessonRecordId: 3, studentId: 5, studentName: '최동현', attendance: '출석' },
  ],
};

const mockComments: Record<number, LessonComment[]> = {
  1: [
    { id: 1, lessonRecordId: 1, authorId: 100, authorName: '김선생님', authorRole: '선생님', message: '오늘 수업 잘 따라와주었습니다. 판별식 부분은 다음 시간에 복습할게요.', createdAt: '2025-03-03T16:30:00' },
    { id: 2, lessonRecordId: 1, authorId: 201, authorName: '김영수(철수 아버지)', authorRole: '학부모', message: '감사합니다 선생님. 집에서도 복습하도록 하겠습니다.', createdAt: '2025-03-03T19:00:00' },
    { id: 3, lessonRecordId: 1, authorId: 1, authorName: '김철수', authorRole: '학생', message: '판별식 부분이 조금 어려웠는데 다음에 복습해주시면 감사하겠습니다!', createdAt: '2025-03-03T20:00:00' },
  ],
  2: [
    { id: 4, lessonRecordId: 2, authorId: 100, authorName: '김선생님', authorRole: '선생님', message: '이차함수 그래프 그리기 과제를 꼭 제출해주세요. 다음 수업에서 확인합니다.', createdAt: '2025-03-10T16:30:00' },
  ],
};

// ==================== API Functions (Mock) ====================

let nextRecordId = 100;
let nextStudentRecordId = 100;
let nextCommentId = 100;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** 반 학생 목록 */
export const getClassStudents = async (classId: string) => {
  await delay(200);
  return mockStudentsByClass[classId] || [];
};

/** 수업 기록 목록 조회 */
export const getLessonRecords = async (classId: string): Promise<LessonRecord[]> => {
  await delay(300);
  return (mockLessonRecords[classId] || []).sort((a, b) => b.date.localeCompare(a.date));
};

/** 수업 기록 추가 */
export const createLessonRecord = async (data: CreateLessonRecordDto): Promise<LessonRecord> => {
  await delay(300);
  const record: LessonRecord = {
    id: nextRecordId++,
    classId: data.classId,
    date: data.date,
    dayOfWeek: getDayOfWeek(data.date),
    time: data.time,
    content: data.content,
    assignmentResult: data.assignmentResult,
    nextAssignment: data.nextAssignment,
    testResult: data.testResult,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (!mockLessonRecords[data.classId]) mockLessonRecords[data.classId] = [];
  mockLessonRecords[data.classId].push(record);

  // 자동으로 학생 출석 레코드 생성
  const students = mockStudentsByClass[data.classId] || [];
  mockStudentRecords[record.id] = students.map(s => ({
    id: nextStudentRecordId++,
    lessonRecordId: record.id,
    studentId: s.id,
    studentName: s.name,
    attendance: '미입력' as AttendanceStatus,
  }));

  return record;
};

/** 수업 기록 수정 */
export const updateLessonRecord = async (id: number, classId: string, data: UpdateLessonRecordDto): Promise<LessonRecord> => {
  await delay(300);
  const records = mockLessonRecords[classId] || [];
  const idx = records.findIndex(r => r.id === id);
  if (idx >= 0) {
    if (data.date) {
      records[idx].dayOfWeek = getDayOfWeek(data.date);
    }
    records[idx] = { ...records[idx], ...data, updatedAt: new Date().toISOString() };
    return records[idx];
  }
  throw new Error('Not found');
};

/** 수업 기록 삭제 */
export const deleteLessonRecord = async (id: number, classId: string): Promise<void> => {
  await delay(300);
  const records = mockLessonRecords[classId] || [];
  const idx = records.findIndex(r => r.id === id);
  if (idx >= 0) records.splice(idx, 1);
  delete mockStudentRecords[id];
  delete mockComments[id];
};

/** 학생별 출석/개별 기록 조회 */
export const getStudentRecords = async (lessonRecordId: number): Promise<StudentLessonRecord[]> => {
  await delay(200);
  return mockStudentRecords[lessonRecordId] || [];
};

/** 학생 개별 기록 일괄 업데이트 */
export const updateStudentRecords = async (
  lessonRecordId: number,
  updates: { studentId: number; data: UpdateStudentRecordDto }[]
): Promise<StudentLessonRecord[]> => {
  await delay(300);
  const records = mockStudentRecords[lessonRecordId] || [];
  for (const upd of updates) {
    const idx = records.findIndex(r => r.studentId === upd.studentId);
    if (idx >= 0) {
      records[idx] = { ...records[idx], ...upd.data };
    }
  }
  return records;
};

/** 코멘트 조회 */
export const getComments = async (lessonRecordId: number): Promise<LessonComment[]> => {
  await delay(200);
  return (mockComments[lessonRecordId] || []).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

/** 코멘트 추가 */
export const addComment = async (lessonRecordId: number, message: string): Promise<LessonComment> => {
  await delay(200);
  const comment: LessonComment = {
    id: nextCommentId++,
    lessonRecordId,
    authorId: 100,
    authorName: '김선생님',
    authorRole: '선생님',
    message,
    createdAt: new Date().toISOString(),
  };
  if (!mockComments[lessonRecordId]) mockComments[lessonRecordId] = [];
  mockComments[lessonRecordId].push(comment);
  return comment;
};
