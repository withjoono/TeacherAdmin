"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    Loader2,
    Calendar,
    Save,
} from "lucide-react";
import { useAttendanceStore } from "@/lib/stores/attendance-store";
import {
    getMyClasses,
    getClassStudents,
    bulkCheckAttendance,
    getAttendance,
} from "@/lib/api/teacher";
import type {
    ClassInfo,
    StudentInfo,
    AttendanceRecord,
} from "@/lib/api/teacher";

// ==================== Types ====================
interface Student {
    id: number;
    name: string;
    password: string;
}

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
    const [classes, setClasses] = useState<
        Array<{ id: string; name: string; subject: string }>
    >([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    // 학생 자기 체크인
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // 선생님 일괄 관리
    const [teacherStatuses, setTeacherStatuses] = useState<
        Record<string, "present" | "late" | "absent">
    >({});
    const [bulkDate, setBulkDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [bulkSaving, setBulkSaving] = useState(false);
    const [bulkSaved, setBulkSaved] = useState(false);

    // 출결 조회
    const [viewDate, setViewDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [attendanceRecords, setAttendanceRecords] = useState<
        AttendanceRecord[]
    >([]);
    const [viewLoading, setViewLoading] = useState(false);

    const { checkIn, getClassRecords, resetClass } = useAttendanceStore();
    const classRecords = useAttendanceStore(
        (s) => s.records[selectedClass] || {}
    );

    const selectedClassInfo = classes.find((c) => c.id === selectedClass);

    // 반 목록 로드
    useEffect(() => {
        async function fetchClasses() {
            try {
                setLoading(true);
                const data = await getMyClasses();
                const mapped = (data || []).map((c: ClassInfo) => ({
                    id: c.id,
                    name: c.name,
                    subject: c.subject || "",
                }));
                setClasses(mapped);
                if (mapped.length > 0) {
                    setSelectedClass(mapped[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch classes:", err);
                setClasses([]);
            } finally {
                setLoading(false);
            }
        }
        fetchClasses();
    }, []);

    // 학생 로드
    useEffect(() => {
        if (!selectedClass) return;
        async function fetchStudents() {
            try {
                const data = await getClassStudents(selectedClass);
                const mapped: Student[] = (data || []).map((s: StudentInfo) => ({
                    id:
                        typeof s.id === "string"
                            ? parseInt(s.id, 10) || 0
                            : Number(s.id),
                    name: s.name,
                    password: "1234",
                }));
                setStudents(sortByName(mapped));

                const existing = getClassRecords(selectedClass);
                if (Object.keys(existing).length === 0) {
                    resetClass(selectedClass, mapped);
                }

                // 선생님 관리용 초기화
                const statuses: Record<string, "present" | "late" | "absent"> = {};
                mapped.forEach((s) => {
                    statuses[String(s.id)] = "present";
                });
                setTeacherStatuses(statuses);
            } catch (err) {
                console.error("Failed to fetch students:", err);
                setStudents([]);
            }
        }
        fetchStudents();
    }, [selectedClass, getClassRecords, resetClass]);

    // 학생 체크인 클릭
    const handleStudentClick = (student: Student) => {
        const entry = classRecords[student.id];
        if (entry?.status === "출석") return;
        setSelectedStudent(student);
        setPassword("");
        setError("");
        setSuccess(false);
        setDialogOpen(true);
    };

    // 비밀번호 확인
    const handlePasswordSubmit = async () => {
        if (!selectedStudent) return;
        if (password === selectedStudent.password) {
            checkIn(selectedClass, selectedStudent.id, selectedStudent.name);
            setSuccess(true);
            setError("");
            try {
                await bulkCheckAttendance(selectedClass, {
                    date: new Date().toISOString().split("T")[0],
                    records: [
                        { studentId: String(selectedStudent.id), status: "present" },
                    ],
                });
            } catch (err) {
                console.error("Failed to save attendance to API:", err);
            }
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

    // 선생님 일괄 저장
    const handleBulkSave = async () => {
        if (!selectedClass) return;
        try {
            setBulkSaving(true);
            const records = Object.entries(teacherStatuses).map(
                ([studentId, status]) => ({
                    studentId,
                    status,
                })
            );
            await bulkCheckAttendance(selectedClass, {
                date: bulkDate,
                records,
            });
            setBulkSaved(true);
            setTimeout(() => setBulkSaved(false), 3000);
        } catch (err) {
            console.error("Failed to save bulk attendance:", err);
            alert("출결 저장에 실패했습니다.");
        } finally {
            setBulkSaving(false);
        }
    };

    // 출결 조회
    const fetchAttendanceView = useCallback(async () => {
        if (!selectedClass) return;
        try {
            setViewLoading(true);
            const data = await getAttendance(selectedClass, viewDate);
            setAttendanceRecords(data || []);
        } catch (err) {
            console.error("Failed to fetch attendance:", err);
            setAttendanceRecords([]);
        } finally {
            setViewLoading(false);
        }
    }, [selectedClass, viewDate]);

    useEffect(() => {
        fetchAttendanceView();
    }, [fetchAttendanceView]);

    // 통계
    const total = students.length;
    const checkedIn = Object.values(classRecords).filter(
        (e) => e.status === "출석"
    ).length;

    // 출결 조회 통계
    const viewStats = {
        present: attendanceRecords.filter((r) => r.status === "present").length,
        late: attendanceRecords.filter((r) => r.status === "late").length,
        absent: attendanceRecords.filter((r) => r.status === "absent").length,
    };

    if (loading) {
        return (
            <div className="flex flex-col">
                <Header title="출결 관리" />
                <div className="flex-1 flex items-center justify-center p-6">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <Header title="출결 관리" />

            <div className="flex-1 p-6 space-y-6">
                {/* 반 선택 */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex gap-2 flex-wrap items-center">
                            <span className="text-sm font-medium text-muted-foreground mr-2">
                                반 선택
                            </span>
                            {classes.map((cls) => (
                                <button
                                    key={cls.id}
                                    onClick={() => setSelectedClass(cls.id)}
                                    className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${cls.id === selectedClass
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "bg-muted hover:bg-muted/80"
                                        }`}
                                >
                                    {cls.name}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 탭 */}
                <Tabs defaultValue="checkin" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="checkin">
                            <Lock className="w-4 h-4 mr-2" />
                            학생 출석
                        </TabsTrigger>
                        <TabsTrigger value="teacher">
                            <Users className="w-4 h-4 mr-2" />
                            일괄 관리
                        </TabsTrigger>
                        <TabsTrigger value="view">
                            <Calendar className="w-4 h-4 mr-2" />
                            출결 조회
                        </TabsTrigger>
                    </TabsList>

                    {/* 학생 자기 체크인 */}
                    <TabsContent value="checkin" className="space-y-4">
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
                                    <span className="font-semibold text-green-600">
                                        {checkedIn}
                                    </span>
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

                        <Card>
                            <CardContent className="p-8">
                                {students.length > 0 ? (
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
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground py-8">
                                        반을 선택하면 학생 목록이 표시됩니다
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 선생님 일괄 관리 */}
                    <TabsContent value="teacher" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        일괄 출결 관리
                                    </CardTitle>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            type="date"
                                            value={bulkDate}
                                            onChange={(e) => setBulkDate(e.target.value)}
                                            className="w-auto"
                                        />
                                        <Button onClick={handleBulkSave} disabled={bulkSaving}>
                                            {bulkSaving ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <Save className="w-4 h-4 mr-2" />
                                            )}
                                            일괄 저장
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {bulkSaved && (
                                    <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4" />
                                        출결이 저장되었습니다.
                                    </div>
                                )}
                                {students.length > 0 ? (
                                    <div className="space-y-2">
                                        {/* 헤더 */}
                                        <div className="grid grid-cols-4 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                                            <div>학생</div>
                                            <div className="text-center">출석</div>
                                            <div className="text-center">지각</div>
                                            <div className="text-center">결석</div>
                                        </div>
                                        {students.map((student) => {
                                            const sid = String(student.id);
                                            const status = teacherStatuses[sid] || "present";
                                            return (
                                                <div
                                                    key={student.id}
                                                    className="grid grid-cols-4 gap-4 items-center px-4 py-3 rounded-lg hover:bg-accent/30 transition-colors"
                                                >
                                                    <div className="font-medium">{student.name}</div>
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() =>
                                                                setTeacherStatuses((prev) => ({
                                                                    ...prev,
                                                                    [sid]: "present",
                                                                }))
                                                            }
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${status === "present"
                                                                    ? "bg-green-500 text-white shadow-md ring-2 ring-green-200"
                                                                    : "bg-gray-100 text-gray-400 hover:bg-green-50"
                                                                }`}
                                                        >
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() =>
                                                                setTeacherStatuses((prev) => ({
                                                                    ...prev,
                                                                    [sid]: "late",
                                                                }))
                                                            }
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${status === "late"
                                                                    ? "bg-yellow-500 text-white shadow-md ring-2 ring-yellow-200"
                                                                    : "bg-gray-100 text-gray-400 hover:bg-yellow-50"
                                                                }`}
                                                        >
                                                            <Clock className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() =>
                                                                setTeacherStatuses((prev) => ({
                                                                    ...prev,
                                                                    [sid]: "absent",
                                                                }))
                                                            }
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${status === "absent"
                                                                    ? "bg-red-500 text-white shadow-md ring-2 ring-red-200"
                                                                    : "bg-gray-100 text-gray-400 hover:bg-red-50"
                                                                }`}
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground py-8">
                                        학생이 없습니다
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 출결 조회 */}
                    <TabsContent value="view" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        출결 조회
                                    </CardTitle>
                                    <Input
                                        type="date"
                                        value={viewDate}
                                        onChange={(e) => setViewDate(e.target.value)}
                                        className="w-auto"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* 통계 */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 rounded-lg bg-green-50 text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {viewStats.present}
                                        </p>
                                        <p className="text-xs text-muted-foreground">출석</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-yellow-50 text-center">
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {viewStats.late}
                                        </p>
                                        <p className="text-xs text-muted-foreground">지각</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-red-50 text-center">
                                        <p className="text-2xl font-bold text-red-600">
                                            {viewStats.absent}
                                        </p>
                                        <p className="text-xs text-muted-foreground">결석</p>
                                    </div>
                                </div>

                                {/* 출결 비율 바 */}
                                {attendanceRecords.length > 0 && (
                                    <div className="mb-6">
                                        <div className="h-4 rounded-full overflow-hidden flex">
                                            {viewStats.present > 0 && (
                                                <div
                                                    className="bg-green-500 transition-all"
                                                    style={{
                                                        width: `${(viewStats.present / attendanceRecords.length) * 100}%`,
                                                    }}
                                                />
                                            )}
                                            {viewStats.late > 0 && (
                                                <div
                                                    className="bg-yellow-500 transition-all"
                                                    style={{
                                                        width: `${(viewStats.late / attendanceRecords.length) * 100}%`,
                                                    }}
                                                />
                                            )}
                                            {viewStats.absent > 0 && (
                                                <div
                                                    className="bg-red-500 transition-all"
                                                    style={{
                                                        width: `${(viewStats.absent / attendanceRecords.length) * 100}%`,
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 테이블 */}
                                {viewLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : attendanceRecords.length > 0 ? (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-3 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                                            <div>학생</div>
                                            <div>상태</div>
                                            <div>비고</div>
                                        </div>
                                        {attendanceRecords.map((record, idx) => (
                                            <div
                                                key={idx}
                                                className="grid grid-cols-3 gap-4 items-center px-4 py-3 rounded-lg hover:bg-accent/30"
                                            >
                                                <div className="font-medium">
                                                    {record.studentName}
                                                </div>
                                                <div>
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${record.status === "present"
                                                                ? "bg-green-100 text-green-700"
                                                                : record.status === "late"
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {record.status === "present" && (
                                                            <CheckCircle2 className="w-3 h-3" />
                                                        )}
                                                        {record.status === "late" && (
                                                            <Clock className="w-3 h-3" />
                                                        )}
                                                        {record.status === "absent" && (
                                                            <XCircle className="w-3 h-3" />
                                                        )}
                                                        {record.status === "present"
                                                            ? "출석"
                                                            : record.status === "late"
                                                                ? "지각"
                                                                : "결석"}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {record.note || "-"}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground py-8">
                                        해당 날짜의 출결 기록이 없습니다
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* 비밀번호 다이얼로그 */}
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
