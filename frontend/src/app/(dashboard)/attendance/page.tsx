"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Lock,
  Users,
  Calendar,
  Save,
  Loader2,
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
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ==================== Types ====================
interface Student {
  id: number;
  name: string;
  password: string;
}

function sortByName(students: Student[]): Student[] {
  return [...students].sort((a, b) => a.name.localeCompare(b.name, "ko"));
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
      <PageContainer className="space-y-6">
        <PageHeader
          title="출결 관리"
          description="학생들의 출석을 확인하고 일괄 관리하세요"
        />
        <Spinner full label="출결 정보를 불러오는 중..." />
      </PageContainer>
    );
  }

  const TABS = [
    { id: "checkin", icon: Lock, label: "학생 출석" },
    { id: "teacher", icon: Users, label: "일괄 관리" },
    { id: "view", icon: Calendar, label: "출결 조회" },
  ];

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="출결 관리"
        description="학생들의 출석을 확인하고 일괄 관리하세요"
      />

      {/* 반 선택 */}
      <div className="rounded-xl border bg-card p-4">
        <p className="mb-3 text-sm font-semibold text-muted-foreground">
          반 선택
        </p>
        <div className="flex flex-wrap gap-2">
          {classes.map((cls) => (
            <Button
              key={cls.id}
              variant={
                String(cls.id) === selectedClass ? "default" : "outline"
              }
              size="sm"
              onClick={() => setSelectedClass(cls.id)}
            >
              {cls.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 탭 헤더 */}
      <div className="flex gap-6 border-b">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 py-3 text-sm transition-colors",
                isActive
                  ? "border-primary font-semibold text-primary"
                  : "border-transparent font-medium text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 학생 자기 체크인 */}
      {activeTab === "checkin" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Users className="h-4 w-4 text-primary" />
                {selectedClassInfo?.name} 출석부
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                학생 이름을 눌러 출석해주세요
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-emerald-600">
                  {checkedIn}
                </span>
                <span className="text-muted-foreground">출석</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">
                  {total - checkedIn}
                </span>
                <span className="text-muted-foreground">미출석</span>
              </div>
              <div className="text-muted-foreground">/ 총 {total}명</div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-8">
            {students.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] justify-items-center gap-6">
                {students.map((student) => {
                  const entry = classRecords[student.id];
                  const isCheckedIn = entry?.status === "출석";
                  return (
                    <button
                      key={student.id}
                      onClick={() => handleStudentClick(student)}
                      disabled={isCheckedIn}
                      className={cn(
                        "flex flex-col items-center gap-2 transition-transform",
                        !isCheckedIn && "hover:scale-105"
                      )}
                    >
                      <div
                        className={cn(
                          "relative flex h-20 w-20 items-center justify-center rounded-full text-lg font-bold text-white shadow-md",
                          isCheckedIn
                            ? "border-4 border-emerald-100 bg-emerald-500"
                            : "bg-primary"
                        )}
                      >
                        <span className="text-center leading-none">
                          {student.name.length <= 3
                            ? student.name
                            : student.name.substring(0, 2)}
                        </span>
                        {isCheckedIn && (
                          <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          </div>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isCheckedIn
                            ? "text-emerald-600"
                            : "text-foreground"
                        )}
                      >
                        {student.name}
                      </span>
                      {isCheckedIn && entry?.checkedInAt && (
                        <span className="-mt-1 text-[10px] text-emerald-600">
                          {entry.checkedInAt}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="학생이 없습니다"
                description="반을 선택하면 학생 목록이 표시됩니다"
              />
            )}
          </div>
        </div>
      )}

      {/* 선생님 일괄 관리 */}
      {activeTab === "teacher" && (
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Users className="h-4 w-4 text-primary" />
              일괄 출결 관리
            </h2>
            <div className="flex items-center gap-3">
              <Input
                type="date"
                value={bulkDate}
                onChange={(e) => setBulkDate(e.target.value)}
                className="w-auto"
              />
              <Button onClick={handleBulkSave} disabled={bulkSaving}>
                {bulkSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                일괄 저장
              </Button>
            </div>
          </div>

          {bulkSaved && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              출결이 저장되었습니다.
            </div>
          )}

          {students.length > 0 ? (
            <div>
              <div className="grid grid-cols-4 gap-4 border-b px-4 py-2 text-sm font-medium text-muted-foreground">
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
                    className="grid grid-cols-4 items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted"
                  >
                    <div className="font-medium text-foreground">
                      {student.name}
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() =>
                          setTeacherStatuses((prev) => ({
                            ...prev,
                            [sid]: "present",
                          }))
                        }
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                          status === "present"
                            ? "bg-emerald-500 text-white shadow-md"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <CheckCircle2 className="h-5 w-5" />
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
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                          status === "late"
                            ? "bg-amber-500 text-white shadow-md"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Clock className="h-5 w-5" />
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
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                          status === "absent"
                            ? "bg-rose-500 text-white shadow-md"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="학생이 없습니다"
              description="반을 선택하면 학생 목록이 표시됩니다"
            />
          )}
        </div>
      )}

      {/* 출결 조회 */}
      {activeTab === "view" && (
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              출결 조회
            </h2>
            <Input
              type="date"
              value={viewDate}
              onChange={(e) => setViewDate(e.target.value)}
              className="w-auto"
            />
          </div>

          {/* 통계 */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-emerald-50 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {viewStats.present}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">출석</div>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">
                {viewStats.late}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">지각</div>
            </div>
            <div className="rounded-lg bg-rose-50 p-4 text-center">
              <div className="text-2xl font-bold text-rose-600">
                {viewStats.absent}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">결석</div>
            </div>
          </div>

          {/* 비율 바 */}
          {attendanceRecords.length > 0 && (
            <div className="mb-6">
              <div className="flex h-4 overflow-hidden rounded-full bg-muted">
                {viewStats.present > 0 && (
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{
                      width: `${
                        (viewStats.present / attendanceRecords.length) * 100
                      }%`,
                    }}
                  />
                )}
                {viewStats.late > 0 && (
                  <div
                    className="bg-amber-500 transition-all"
                    style={{
                      width: `${
                        (viewStats.late / attendanceRecords.length) * 100
                      }%`,
                    }}
                  />
                )}
                {viewStats.absent > 0 && (
                  <div
                    className="bg-rose-500 transition-all"
                    style={{
                      width: `${
                        (viewStats.absent / attendanceRecords.length) * 100
                      }%`,
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {viewLoading ? (
            <Spinner label="출결 기록을 불러오는 중..." />
          ) : attendanceRecords.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-3 text-left font-semibold">학생</th>
                  <th className="p-3 text-left font-semibold">상태</th>
                  <th className="p-3 text-left font-semibold">비고</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-3 text-sm font-semibold">
                      {record.studentName}
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                          record.status === "present"
                            ? "bg-emerald-100 text-emerald-700"
                            : record.status === "late"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                        )}
                      >
                        {record.status === "present" && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {record.status === "late" && (
                          <Clock className="h-3 w-3" />
                        )}
                        {record.status === "absent" && (
                          <XCircle className="h-3 w-3" />
                        )}
                        {record.status === "present"
                          ? "출석"
                          : record.status === "late"
                            ? "지각"
                            : "결석"}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {record.note || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              icon={Calendar}
              title="출결 기록이 없습니다"
              description="해당 날짜의 출결 기록이 없습니다"
            />
          )}
        </div>
      )}

      {/* 비밀번호 다이얼로그 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          {success ? (
            <div className="flex flex-col items-center py-8">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <p className="text-xl font-bold text-emerald-600">출석 완료!</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {selectedStudent?.name}님, 환영합니다 👋
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-md">
                  {selectedStudent?.name.length &&
                  selectedStudent.name.length <= 3
                    ? selectedStudent.name
                    : selectedStudent?.name.substring(0, 2)}
                </div>
                <h2 className="text-lg font-semibold leading-none tracking-tight">
                  {selectedStudent?.name}
                </h2>
              </div>
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
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
                  className="h-12 text-center text-lg tracking-[0.2em]"
                  autoFocus
                />
                {error && (
                  <div className="flex items-center justify-center gap-1.5 text-sm text-destructive">
                    <XCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  className="w-24"
                  onClick={() => {
                    setDialogOpen(false);
                    setSuccess(false);
                    setError("");
                  }}
                >
                  취소
                </Button>
                <Button
                  className="w-24"
                  onClick={handlePasswordSubmit}
                  disabled={!password}
                >
                  출석
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
