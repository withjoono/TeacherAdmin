import { create } from 'zustand';

export type AttendanceStatus = '출석' | '지각' | '결석' | '미출석' | '미입력';

export interface CheckInRecord {
    studentId: number;
    studentName: string;
    classId: string;
    status: AttendanceStatus;
    checkedInAt?: string;  // "14:32" 형식
}

interface AttendanceStore {
    /** classId → studentId → CheckInRecord */
    records: Record<string, Record<number, CheckInRecord>>;

    /** 학생 출석 체크인 */
    checkIn: (classId: string, studentId: number, studentName: string) => void;

    /** 특정 반의 출석 기록 조회 */
    getClassRecords: (classId: string) => Record<number, CheckInRecord>;

    /** 특정 학생의 출석 상태 조회 */
    getStudentStatus: (classId: string, studentId: number) => CheckInRecord | undefined;

    /** 반 출석 기록 초기화 */
    resetClass: (classId: string, students: { id: number; name: string }[]) => void;
}

export const useAttendanceStore = create<AttendanceStore>((set, get) => ({
    records: {},

    checkIn: (classId, studentId, studentName) => {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        set((state) => ({
            records: {
                ...state.records,
                [classId]: {
                    ...(state.records[classId] || {}),
                    [studentId]: {
                        studentId,
                        studentName,
                        classId,
                        status: '출석',
                        checkedInAt: timeStr,
                    },
                },
            },
        }));
    },

    getClassRecords: (classId) => {
        return get().records[classId] || {};
    },

    getStudentStatus: (classId, studentId) => {
        return get().records[classId]?.[studentId];
    },

    resetClass: (classId, students) => {
        const initial: Record<number, CheckInRecord> = {};
        students.forEach((s) => {
            initial[s.id] = {
                studentId: s.id,
                studentName: s.name,
                classId,
                status: '미출석',
            };
        });
        set((state) => ({
            records: {
                ...state.records,
                [classId]: initial,
            },
        }));
    },
}));
