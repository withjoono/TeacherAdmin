"use client";

import { useState, useEffect } from "react";
import { Check, UserCheck, Clock, XCircle, Minus } from "lucide-react";
import { useAttendanceStore } from "@/lib/stores/attendance-store";
import type { AttendanceStatus } from "@/lib/stores/attendance-store";
import type { StudentLessonRecord, UpdateStudentRecordDto } from "@/lib/api/curriculum";
import { getStudentRecords, updateStudentRecords } from "@/lib/api/curriculum";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface AttendanceTableProps {
    lessonRecordId: number;
    classId: string;
}

const attendanceOptions: { value: AttendanceStatus; label: string; icon: React.ReactNode; activeClass: string }[] = [
    { value: '출석', label: '출석', icon: <UserCheck className="h-3.5 w-3.5" />, activeClass: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { value: '지각', label: '지각', icon: <Clock className="h-3.5 w-3.5" />, activeClass: 'bg-amber-100 text-amber-700 border-amber-300' },
    { value: '결석', label: '결석', icon: <XCircle className="h-3.5 w-3.5" />, activeClass: 'bg-rose-100 text-rose-700 border-rose-300' },
    { value: '미입력', label: '-', icon: <Minus className="h-3.5 w-3.5" />, activeClass: 'bg-muted text-muted-foreground border-border' },
];

export function AttendanceTable({ lessonRecordId, classId }: AttendanceTableProps) {
    const [records, setRecords] = useState<StudentLessonRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    // 출석부 스토어에서 체크인 기록 실시간 읽기
    const storeRecords = useAttendanceStore((s) => s.records[classId] || {});

    useEffect(() => {
        setLoading(true);
        getStudentRecords(lessonRecordId)
            .then(setRecords)
            .finally(() => setLoading(false));
    }, [lessonRecordId]);

    // 스토어의 출석 기록을 반영 (출석부에서 체크인된 학생)
    const mergedRecords = records.map((record) => {
        if (!record) return record; // Safety check
        const storeEntry = storeRecords[Number(record.studentId)];
        if (storeEntry?.status === '출석' && record.attendance !== '출석') {
            return {
                ...record,
                attendance: '출석' as const,
                checkedInAt: storeEntry.checkedInAt,
            };
        }
        return record;
    });

    const handleAttendanceChange = (studentId: string, attendance: string) => {
        setRecords(prev =>
            prev.map(r => r.studentId === studentId ? { ...r, attendance: attendance as any } : r)
        );
        setDirty(true);
    };

    const handleBatchAttendance = (attendance: string) => {
        setRecords(prev => prev.map(r => ({ ...r, attendance: attendance as any })));
        setDirty(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = mergedRecords.map(r => ({
                studentId: r.studentId,
                data: { attendance: r.attendance } as UpdateStudentRecordDto,
            }));
            await updateStudentRecords(lessonRecordId, updates);
            setDirty(false);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Spinner label="로딩 중..." />;
    }

    if (mergedRecords.length === 0) {
        return <div className="py-3 text-sm text-muted-foreground">학생 정보가 없습니다.</div>;
    }

    const attendanceSummary = {
        출석: mergedRecords.filter(r => r.attendance === '출석').length,
        지각: mergedRecords.filter(r => r.attendance === '지각').length,
        결석: mergedRecords.filter(r => r.attendance === '결석').length,
    };

    return (
        <div className="space-y-3">
            {/* 요약 + 일괄 버튼 */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs">
                    <span className="font-medium text-emerald-600">출석 {attendanceSummary.출석}</span>
                    <span className="font-medium text-amber-600">지각 {attendanceSummary.지각}</span>
                    <span className="font-medium text-rose-600">결석 {attendanceSummary.결석}</span>
                    <span className="text-muted-foreground">/ 총 {mergedRecords.length}명</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">일괄:</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBatchAttendance('출석')}
                    >
                        전원 출석
                    </Button>
                    {dirty && (
                        <Button size="sm" onClick={handleSave} disabled={saving}>
                            <Check className="h-3.5 w-3.5" />
                            {saving ? "저장 중..." : "저장"}
                        </Button>
                    )}
                </div>
            </div>

            {/* 학생 목록 */}
            <div className="space-y-1.5">
                {mergedRecords.map((record) => {
                    const storeEntry = storeRecords[Number(record.studentId)];
                    const fromAttendancePage = storeEntry?.status === '출석';

                    return (
                        <div
                            key={record.studentId}
                            className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 transition-colors hover:bg-accent/50"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                    {record.studentName.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-foreground">{record.studentName}</span>
                                {/* 출석부 체크인 시간 표시 */}
                                {fromAttendancePage && storeEntry.checkedInAt && (
                                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] text-emerald-600">
                                        {storeEntry.checkedInAt} 출석부 체크인
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {attendanceOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleAttendanceChange(record.studentId, opt.value)}
                                        className={cn(
                                            "flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-all",
                                            record.attendance === opt.value
                                                ? cn(opt.activeClass, "font-semibold shadow-sm")
                                                : "border-border bg-card text-muted-foreground hover:bg-muted",
                                        )}
                                    >
                                        {opt.icon}
                                        {opt.value !== '미입력' ? opt.label : ''}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
