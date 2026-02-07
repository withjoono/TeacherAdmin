"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    CheckCircle2,
    Clock,
    XCircle,
    Lock,
    Users,
} from "lucide-react";
import { useAttendanceStore } from "@/lib/stores/attendance-store";

// ==================== Types ====================
interface Student {
    id: number;
    name: string;
    password: string;
}

// ==================== Mock Data ====================
const mockClasses = [
    { id: "class-a", name: "A반", subject: "수학" },
    { id: "class-b", name: "B반", subject: "영어" },
    { id: "class-c", name: "C반", subject: "국어" },
];

const mockStudentsByClass: Record<string, Student[]> = {
    "class-a": [
        { id: 1, name: "김철수", password: "1234" },
        { id: 2, name: "이영희", password: "1234" },
        { id: 3, name: "박민수", password: "1234" },
        { id: 4, name: "정수현", password: "1234" },
        { id: 5, name: "최동현", password: "1234" },
        { id: 6, name: "강민재", password: "1234" },
        { id: 7, name: "한지원", password: "1234" },
        { id: 8, name: "윤서연", password: "1234" },
    ],
    "class-b": [
        { id: 9, name: "송예진", password: "1234" },
        { id: 10, name: "조민서", password: "1234" },
        { id: 11, name: "임하늘", password: "1234" },
        { id: 12, name: "배수지", password: "1234" },
    ],
    "class-c": [
        { id: 13, name: "오지훈", password: "1234" },
        { id: 14, name: "노유진", password: "1234" },
        { id: 15, name: "문태양", password: "1234" },
    ],
};

function sortByName(students: Student[]): Student[] {
    return [...students].sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

const CIRCLE_COLORS = [
    "from-blue-400 to-blue-600",
    "from-purple-400 to-purple-600",
    "from-pink-400 to-pink-600",
    "from-teal-400 to-teal-600",
    "from-indigo-400 to-indigo-600",
    "from-emerald-400 to-emerald-600",
    "from-orange-400 to-orange-600",
    "from-cyan-400 to-cyan-600",
];

function getCircleColor(index: number) {
    return CIRCLE_COLORS[index % CIRCLE_COLORS.length];
}

// ==================== 메인 페이지 ====================
export default function AttendancePage() {
    const [selectedClass, setSelectedClass] = useState(mockClasses[0].id);
    const [students, setStudents] = useState<Student[]>([]);

    // 비밀번호 다이얼로그
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Zustand 스토어
    const { checkIn, getClassRecords, resetClass } = useAttendanceStore();
    const classRecords = useAttendanceStore((s) => s.records[selectedClass] || {});

    const selectedClassInfo = mockClasses.find((c) => c.id === selectedClass);

    // 학생 로드 + 스토어 초기화
    useEffect(() => {
        const raw = mockStudentsByClass[selectedClass] || [];
        setStudents(sortByName(raw));

        // 기존 기록이 없으면 초기화
        const existing = getClassRecords(selectedClass);
        if (Object.keys(existing).length === 0) {
            resetClass(selectedClass, raw);
        }
    }, [selectedClass, getClassRecords, resetClass]);

    // 학생 클릭
    const handleStudentClick = (student: Student) => {
        const entry = classRecords[student.id];
        if (entry?.status === "출석") return;
        setSelectedStudent(student);
        setPassword("");
        setError("");
        setSuccess(false);
        setDialogOpen(true);
    };

    // 비밀번호 확인 → 스토어에 체크인
    const handlePasswordSubmit = () => {
        if (!selectedStudent) return;

        if (password === selectedStudent.password) {
            checkIn(selectedClass, selectedStudent.id, selectedStudent.name);
            setSuccess(true);
            setError("");
            setTimeout(() => {
                setDialogOpen(false);
                setSuccess(false);
            }, 1200);
        } else {
            setError("비밀번호가 틀렸습니다. 다시 입력해주세요.");
            setPassword("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handlePasswordSubmit();
        }
    };

    // 통계
    const total = students.length;
    const checkedIn = Object.values(classRecords).filter(
        (e) => e.status === "출석"
    ).length;

    return (
        <div className="flex flex-col">
            <Header title="출석부" />

            <div className="flex-1 p-6 space-y-6">
                {/* 반 선택 */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex gap-2 flex-wrap items-center">
                            <span className="text-sm font-medium text-muted-foreground mr-2">
                                반 선택
                            </span>
                            {mockClasses.map((cls) => (
                                <button
                                    key={cls.id}
                                    onClick={() => setSelectedClass(cls.id)}
                                    className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${cls.id === selectedClass
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "bg-muted hover:bg-muted/80"
                                        }`}
                                >
                                    {cls.name}
                                    <span className="ml-1.5 text-xs opacity-80">
                                        · {cls.subject}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 출석 현황 요약 */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            {selectedClassInfo?.name} 출석부
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            학생 이름을 눌러 출석해주세요
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="font-semibold text-green-600">{checkedIn}</span>
                            <span className="text-muted-foreground">출석</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold text-gray-500">
                                {total - checkedIn}
                            </span>
                            <span className="text-muted-foreground">미출석</span>
                        </div>
                        <div className="text-muted-foreground">/ 총 {total}명</div>
                    </div>
                </div>

                {/* 학생 그리드 */}
                <Card>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-6 justify-items-center">
                            {students.map((student, idx) => {
                                const entry = classRecords[student.id];
                                const isCheckedIn = entry?.status === "출석";

                                return (
                                    <button
                                        key={student.id}
                                        onClick={() => handleStudentClick(student)}
                                        className={`group flex flex-col items-center gap-2 transition-all ${isCheckedIn
                                                ? "cursor-default"
                                                : "cursor-pointer hover:scale-105"
                                            }`}
                                    >
                                        <div
                                            className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all ${isCheckedIn
                                                    ? "bg-gradient-to-br from-green-400 to-green-600 ring-4 ring-green-200"
                                                    : `bg-gradient-to-br ${getCircleColor(idx)} group-hover:shadow-xl group-hover:ring-4 group-hover:ring-primary/20`
                                                }`}
                                        >
                                            <span className="text-center leading-tight">
                                                {student.name.length <= 3
                                                    ? student.name
                                                    : student.name.substring(0, 2)}
                                            </span>
                                            {isCheckedIn && (
                                                <div className="absolute -top-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                </div>
                                            )}
                                        </div>
                                        <span
                                            className={`text-xs font-medium ${isCheckedIn
                                                    ? "text-green-600"
                                                    : "text-muted-foreground group-hover:text-foreground"
                                                }`}
                                        >
                                            {student.name}
                                        </span>
                                        {isCheckedIn && entry?.checkedInAt && (
                                            <span className="text-[10px] text-green-500 -mt-1">
                                                {entry.checkedInAt}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* 범례 */}
                <div className="flex items-center gap-6 text-xs text-muted-foreground justify-center">
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
                        미출석 — 클릭하여 출석
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 ring-2 ring-green-200" />
                        출석 완료
                    </div>
                </div>
            </div>

            {/* ========== 비밀번호 다이얼로그 ========== */}
            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setDialogOpen(false);
                        setSuccess(false);
                    }
                }}
            >
                <DialogContent className="sm:max-w-sm">
                    {success ? (
                        <div className="flex flex-col items-center py-8">
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-in zoom-in-50">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <p className="text-xl font-bold text-green-600">출석 완료!</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {selectedStudent?.name}님, 환영합니다 👋
                            </p>
                        </div>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-center">
                                    <div className="flex flex-col items-center gap-3 mb-2">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                            {selectedStudent?.name.length &&
                                                selectedStudent.name.length <= 3
                                                ? selectedStudent.name
                                                : selectedStudent?.name.substring(0, 2)}
                                        </div>
                                        <span>{selectedStudent?.name}</span>
                                    </div>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 py-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                                    <Lock className="w-4 h-4" />
                                    비밀번호를 입력하여 출석하세요
                                </div>

                                <Input
                                    type="password"
                                    placeholder="비밀번호 입력"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError("");
                                    }}
                                    onKeyDown={handleKeyDown}
                                    className="text-center text-lg tracking-widest h-12"
                                    autoFocus
                                />

                                {error && (
                                    <div className="flex items-center gap-1.5 text-sm text-red-500 justify-center">
                                        <XCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="sm:justify-center gap-2">
                                <DialogClose asChild>
                                    <Button variant="outline" className="w-24">
                                        취소
                                    </Button>
                                </DialogClose>
                                <Button
                                    onClick={handlePasswordSubmit}
                                    disabled={!password}
                                    className="w-24"
                                >
                                    출석
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
