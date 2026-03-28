"use client";

import { useState, useEffect, useCallback } from "react";
import {
    CheckCircle2,
    Clock,
    XCircle,
    Lock,
    Users,
    Loader2,
    Calendar,
    Save,
    X,
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

    const [activeTab, setActiveTab] = useState("checkin"); // "checkin", "teacher", "view"

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
            <div className="gb-page-dashboard gb-stack gb-stack-6" style={{ paddingTop: "var(--space-10)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
                    <Loader2 style={{ width: 32, height: 32, color: "var(--color-text-disabled)", animation: "spin 1s linear infinite" }} />
                </div>
            </div>
        );
    }

    return (
        <div className="gb-page-dashboard gb-stack gb-stack-8" style={{ paddingTop: "var(--space-10)" }}>
            {/* 페이지 헤더 */}
            <div className="gb-page-header" style={{ marginBottom: 0 }}>
                <h1 className="gb-page-title">출결 관리</h1>
                <p className="gb-page-desc">
                    학생들의 출석을 확인하고 일괄 관리하세요
                </p>
            </div>

            <div className="gb-stack gb-stack-6">
                {/* 반 선택 */}
                <div className="gb-card">
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-3)" }}>
                        반 선택
                    </div>
                    <div className="gb-row gb-row-3" style={{ flexWrap: "wrap" }}>
                        {classes.map((cls) => (
                            <button
                                key={cls.id}
                                onClick={() => setSelectedClass(cls.id)}
                                className={`gb-btn ${String(cls.id) === selectedClass ? 'gb-btn-primary' : 'gb-btn-outline'}`}
                            >
                                {cls.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 탭 헤더 */}
                <div style={{ display: "flex", gap: "var(--space-6)", borderBottom: "1px solid var(--color-border-light)" }}>
                    {[
                        { id: "checkin", icon: Lock, label: "학생 출석" },
                        { id: "teacher", icon: Users, label: "일괄 관리" },
                        { id: "view", icon: Calendar, label: "출결 조회" },
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: "flex", alignItems: "center", gap: "8px",
                                    padding: "var(--space-3) 0",
                                    fontSize: "var(--text-sm)",
                                    fontWeight: isActive ? "var(--weight-semibold)" : "var(--weight-medium)",
                                    color: isActive ? "var(--color-primary)" : "var(--color-text-tertiary)",
                                    borderBottom: isActive ? "2px solid var(--color-primary)" : "2px solid transparent",
                                    background: "none", borderTop: "none", borderLeft: "none", borderRight: "none",
                                    cursor: "pointer", transition: "all var(--transition-short)"
                                }}
                            >
                                <Icon style={{ width: 16, height: 16 }} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* 학생 자기 체크인 */}
                {activeTab === "checkin" && (
                    <div className="gb-stack gb-stack-4">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                            <div>
                                <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: "var(--space-1)" }}>
                                    <Users style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
                                    {selectedClassInfo?.name} 출석부
                                </h2>
                                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
                                    학생 이름을 눌러 출석해주세요
                                </p>
                            </div>
                            <div className="gb-row gb-row-4" style={{ fontSize: "var(--text-sm)" }}>
                                <div className="gb-row gb-row-1">
                                    <CheckCircle2 style={{ width: 16, height: 16, color: "var(--color-success)" }} />
                                    <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-success)" }}>
                                        {checkedIn}
                                    </span>
                                    <span style={{ color: "var(--color-text-tertiary)" }}>출석</span>
                                </div>
                                <div className="gb-row gb-row-1">
                                    <Clock style={{ width: 16, height: 16, color: "var(--color-text-disabled)" }} />
                                    <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-text-secondary)" }}>
                                        {total - checkedIn}
                                    </span>
                                    <span style={{ color: "var(--color-text-tertiary)" }}>미출석</span>
                                </div>
                                <div style={{ color: "var(--color-text-tertiary)" }}>/ 총 {total}명</div>
                            </div>
                        </div>

                        <div className="gb-card" style={{ padding: "var(--space-8)" }}>
                            {students.length > 0 ? (
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                                    gap: "var(--space-6)",
                                    justifyItems: "center"
                                }}>
                                    {students.map((student, idx) => {
                                        const entry = classRecords[student.id];
                                        const isCheckedIn = entry?.status === "출석";
                                        return (
                                            <button
                                                key={student.id}
                                                onClick={() => handleStudentClick(student)}
                                                style={{
                                                    display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                                                    background: "none", border: "none", padding: 0,
                                                    cursor: isCheckedIn ? "default" : "pointer",
                                                    transition: "transform var(--transition-short)"
                                                }}
                                                onMouseEnter={(e) => { if (!isCheckedIn) e.currentTarget.style.transform = "scale(1.05)" }}
                                                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)" }}
                                            >
                                                <div
                                                    style={{
                                                        position: "relative",
                                                        width: "80px", height: "80px", borderRadius: "50%",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        color: "white", fontWeight: "bold", fontSize: "1.125rem",
                                                        boxShadow: "var(--shadow-md)",
                                                        background: isCheckedIn ? "linear-gradient(to bottom right, var(--color-success) 0%, #16a34a 100%)" : `var(--color-primary)`,
                                                        border: isCheckedIn ? "4px solid var(--color-success-10)" : "none",
                                                        transition: "all var(--transition-short)"
                                                    }}
                                                >
                                                    <span style={{ textAlign: "center", lineHeight: 1 }}>
                                                        {student.name.length <= 3
                                                            ? student.name
                                                            : student.name.substring(0, 2)}
                                                    </span>
                                                    {isCheckedIn && (
                                                        <div style={{
                                                            position: "absolute", top: "-4px", right: "-4px",
                                                            width: "28px", height: "28px", background: "white", borderRadius: "50%",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            boxShadow: "var(--shadow-sm)"
                                                        }}>
                                                            <CheckCircle2 style={{ width: 20, height: 20, color: "var(--color-success)" }} />
                                                        </div>
                                                    )}
                                                </div>
                                                <span
                                                    style={{
                                                        fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)",
                                                        color: isCheckedIn ? "var(--color-success)" : "var(--color-text-secondary)"
                                                    }}
                                                >
                                                    {student.name}
                                                </span>
                                                {isCheckedIn && entry?.checkedInAt && (
                                                    <span style={{ fontSize: "10px", color: "var(--color-success)", marginTop: "-4px" }}>
                                                        {entry.checkedInAt}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="gb-empty-state" style={{ padding: "var(--space-8) 0" }}>
                                    반을 선택하면 학생 목록이 표시됩니다
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 선생님 일괄 관리 */}
                {activeTab === "teacher" && (
                    <div className="gb-card">
                        <div className="gb-row gb-row-4" style={{ justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
                            <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
                                <Users style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
                                일괄 출결 관리
                            </h2>
                            <div className="gb-row gb-row-3">
                                <input
                                    type="date"
                                    value={bulkDate}
                                    onChange={(e) => setBulkDate(e.target.value)}
                                    className="gb-input"
                                    style={{ width: "auto" }}
                                />
                                <button
                                    className="gb-btn gb-btn-primary"
                                    onClick={handleBulkSave}
                                    disabled={bulkSaving}
                                >
                                    {bulkSaving ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Save style={{ width: 16, height: 16 }} />}
                                    일괄 저장
                                </button>
                            </div>
                        </div>

                        {bulkSaved && (
                            <div style={{ marginBottom: "var(--space-4)", padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--color-success-10)", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-success)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>
                                <CheckCircle2 style={{ width: 16, height: 16 }} />
                                출결이 저장되었습니다.
                            </div>
                        )}

                        {students.length > 0 ? (
                            <div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", padding: "8px 16px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-tertiary)", borderBottom: "1px solid var(--color-border-light)" }}>
                                    <div>학생</div>
                                    <div style={{ textAlign: "center" }}>출석</div>
                                    <div style={{ textAlign: "center" }}>지각</div>
                                    <div style={{ textAlign: "center" }}>결석</div>
                                </div>
                                {students.map((student) => {
                                    const sid = String(student.id);
                                    const status = teacherStatuses[sid] || "present";
                                    return (
                                        <div
                                            key={student.id}
                                            style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", alignItems: "center", padding: "12px 16px", borderRadius: "var(--radius-lg)", transition: "background var(--transition-short)" }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-bg-secondary)"}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                        >
                                            <div style={{ fontWeight: "var(--weight-medium)", color: "var(--color-text)" }}>{student.name}</div>
                                            <div style={{ display: "flex", justifyContent: "center" }}>
                                                <button
                                                    onClick={() =>
                                                        setTeacherStatuses((prev) => ({
                                                            ...prev,
                                                            [sid]: "present",
                                                        }))
                                                    }
                                                    style={{
                                                        width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all var(--transition-short)", cursor: "pointer", border: "none",
                                                        background: status === "present" ? "var(--color-success)" : "var(--color-bg-secondary)",
                                                        color: status === "present" ? "white" : "var(--color-text-tertiary)",
                                                        boxShadow: status === "present" ? "var(--shadow-md)" : "none",
                                                    }}
                                                >
                                                    <CheckCircle2 style={{ width: 20, height: 20 }} />
                                                </button>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "center" }}>
                                                <button
                                                    onClick={() =>
                                                        setTeacherStatuses((prev) => ({
                                                            ...prev,
                                                            [sid]: "late",
                                                        }))
                                                    }
                                                    style={{
                                                        width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all var(--transition-short)", cursor: "pointer", border: "none",
                                                        background: status === "late" ? "var(--color-warning)" : "var(--color-bg-secondary)",
                                                        color: status === "late" ? "white" : "var(--color-text-tertiary)",
                                                        boxShadow: status === "late" ? "var(--shadow-md)" : "none",
                                                    }}
                                                >
                                                    <Clock style={{ width: 20, height: 20 }} />
                                                </button>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "center" }}>
                                                <button
                                                    onClick={() =>
                                                        setTeacherStatuses((prev) => ({
                                                            ...prev,
                                                            [sid]: "absent",
                                                        }))
                                                    }
                                                    style={{
                                                        width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all var(--transition-short)", cursor: "pointer", border: "none",
                                                        background: status === "absent" ? "var(--color-error)" : "var(--color-bg-secondary)",
                                                        color: status === "absent" ? "white" : "var(--color-text-tertiary)",
                                                        boxShadow: status === "absent" ? "var(--shadow-md)" : "none",
                                                    }}
                                                >
                                                    <XCircle style={{ width: 20, height: 20 }} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="gb-empty-state" style={{ padding: "var(--space-8) 0" }}>
                                학생이 없습니다
                            </div>
                        )}
                    </div>
                )}

                {/* 출결 조회 */}
                {activeTab === "view" && (
                    <div className="gb-card">
                        <div className="gb-row gb-row-4" style={{ justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
                            <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
                                <Calendar style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
                                출결 조회
                            </h2>
                            <input
                                type="date"
                                value={viewDate}
                                onChange={(e) => setViewDate(e.target.value)}
                                className="gb-input"
                                style={{ width: "auto" }}
                            />
                        </div>

                        {/* 통계 */}
                        <div className="gb-grid gb-grid-3" style={{ marginBottom: "var(--space-6)" }}>
                            <div style={{ background: "var(--color-success-10)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
                                <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-success)" }}>
                                    {viewStats.present}
                                </div>
                                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-1)" }}>출석</div>
                            </div>
                            <div style={{ background: "var(--color-warning-10)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
                                <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-warning)" }}>
                                    {viewStats.late}
                                </div>
                                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-1)" }}>지각</div>
                            </div>
                            <div style={{ background: "var(--color-error-10)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
                                <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-error)" }}>
                                    {viewStats.absent}
                                </div>
                                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-1)" }}>결석</div>
                            </div>
                        </div>

                        {/* 비율 바 */}
                        {attendanceRecords.length > 0 && (
                            <div style={{ marginBottom: "var(--space-6)" }}>
                                <div style={{ height: "16px", borderRadius: "var(--radius-full)", overflow: "hidden", display: "flex", background: "var(--color-bg-secondary)" }}>
                                    {viewStats.present > 0 && (
                                        <div style={{ background: "var(--color-success)", transition: "all var(--transition-normal)", width: `${(viewStats.present / attendanceRecords.length) * 100}%` }} />
                                    )}
                                    {viewStats.late > 0 && (
                                        <div style={{ background: "var(--color-warning)", transition: "all var(--transition-normal)", width: `${(viewStats.late / attendanceRecords.length) * 100}%` }} />
                                    )}
                                    {viewStats.absent > 0 && (
                                        <div style={{ background: "var(--color-error)", transition: "all var(--transition-normal)", width: `${(viewStats.absent / attendanceRecords.length) * 100}%` }} />
                                    )}
                                </div>
                            </div>
                        )}

                        {viewLoading ? (
                            <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-8) 0" }}>
                                <Loader2 style={{ width: 24, height: 24, color: "var(--color-text-disabled)", animation: "spin 1s linear infinite" }} />
                            </div>
                        ) : attendanceRecords.length > 0 ? (
                            <div>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--color-border-light)" }}>
                                            <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>학생</th>
                                            <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>상태</th>
                                            <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>비고</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceRecords.map((record, idx) => (
                                            <tr key={idx} style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                                                <td style={{ padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>
                                                    {record.studentName}
                                                </td>
                                                <td style={{ padding: "var(--space-3)" }}>
                                                    <span className={`gb-badge ${record.status === "present" ? "gb-badge-success" : record.status === "late" ? "gb-badge-warning" : "gb-badge-error"}`}>
                                                        {record.status === "present" && <CheckCircle2 style={{ width: 12, height: 12 }} />}
                                                        {record.status === "late" && <Clock style={{ width: 12, height: 12 }} />}
                                                        {record.status === "absent" && <XCircle style={{ width: 12, height: 12 }} />}
                                                        {record.status === "present" ? "출석" : record.status === "late" ? "지각" : "결석"}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "var(--space-3)", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
                                                    {record.note || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="gb-empty-state" style={{ padding: "var(--space-8) 0" }}>
                                해당 날짜의 출결 기록이 없습니다
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 비밀번호 다이얼로그 */}
            {dialogOpen && (
                <div className="gb-modal-overlay">
                    <div className="gb-modal" style={{ maxWidth: '400px' }}>
                        {success ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "var(--space-8) 0", animation: "bounceIn var(--transition-normal)" }}>
                                <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--color-success-10)", display: "flex", alignItems: "center", justifyItems: "center", marginBottom: "var(--space-4)" }}>
                                    <CheckCircle2 style={{ width: 40, height: 40, color: "var(--color-success)", margin: "auto" }} />
                                </div>
                                <p style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-bold)", color: "var(--color-success)" }}>출석 완료!</p>
                                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)", marginTop: "var(--space-1)" }}>
                                    {selectedStudent?.name}님, 환영합니다 👋
                                </p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "var(--space-4)" }}>
                                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1.25rem", boxShadow: "var(--shadow-md)" }}>
                                        {selectedStudent?.name.length && selectedStudent.name.length <= 3
                                            ? selectedStudent.name
                                            : selectedStudent?.name.substring(0, 2)}
                                    </div>
                                    <h2 className="gb-modal-title" style={{ marginBottom: 0 }}>{selectedStudent?.name}</h2>
                                </div>
                                <div className="gb-stack gb-stack-4" style={{ padding: "var(--space-2) 0" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)", justifyContent: "center" }}>
                                        <Lock style={{ width: 16, height: 16 }} />
                                        비밀번호를 입력하여 출석하세요
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="비밀번호 입력"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError("");
                                        }}
                                        onKeyDown={handleKeyDown}
                                        className="gb-input"
                                        style={{ textAlign: "center", fontSize: "var(--text-lg)", letterSpacing: "0.2em", height: "48px" }}
                                        autoFocus
                                    />
                                    {error && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)", color: "var(--color-error)", justifyContent: "center" }}>
                                            <XCircle style={{ width: 16, height: 16 }} />
                                            {error}
                                        </div>
                                    )}
                                </div>
                                <div className="gb-modal-actions" style={{ marginTop: "var(--space-6)", justifyContent: "center" }}>
                                    <button
                                        className="gb-btn gb-btn-outline"
                                        style={{ width: "100px", justifyContent: "center" }}
                                        onClick={() => {
                                            setDialogOpen(false);
                                            setSuccess(false);
                                            setError("");
                                        }}
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handlePasswordSubmit}
                                        disabled={!password}
                                        className="gb-btn gb-btn-primary"
                                        style={{ width: "100px", justifyContent: "center" }}
                                    >
                                        출석
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
