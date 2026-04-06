"use client";

import { useState, useEffect } from "react";
import { Button } from "geobuk-shared/ui";
import { Check, UserCheck, Clock, XCircle, Minus } from "lucide-react";
import { useAttendanceStore } from "@/lib/stores/attendance-store";
import type { AttendanceStatus } from "@/lib/stores/attendance-store";
import type { StudentLessonRecord, UpdateStudentRecordDto } from "@/lib/api/curriculum";
import { getStudentRecords, updateStudentRecords } from "@/lib/api/curriculum";

interface AttendanceTableProps {
    lessonRecordId: number;
    classId: string;
}

const attendanceOptions: { value: AttendanceStatus; label: string; icon: React.ReactNode; color: string }[] = [
    { value: '출석', label: '출석', icon: <UserCheck className="w-3.5 h-3.5" />, color: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' },
    { value: '지각', label: '지각', icon: <Clock className="w-3.5 h-3.5" />, color: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200' },
    { value: '결석', label: '결석', icon: <XCircle className="w-3.5 h-3.5" />, color: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' },
    { value: '미입력', label: '-', icon: <Minus className="w-3.5 h-3.5" />, color: 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200' },
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
        return <div className="text-sm text-muted-foreground py-3">로딩 중...</div>;
    }

    if (mergedRecords.length === 0) {
        return <div className="text-sm text-muted-foreground py-3">학생 정보가 없습니다.</div>;
    }

    const attendanceSummary = {
        출석: mergedRecords.filter(r => r.attendance === '출석').length,
        지각: mergedRecords.filter(r => r.attendance === '지각').length,
        결석: mergedRecords.filter(r => r.attendance === '결석').length,
    };

    return (
        <div className="space-y-3">
            {/* 요약 + 일괄 버튼 */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 text-xs">
                    <span className="text-green-600 font-medium">출석 {attendanceSummary.출석}</span>
                    <span className="text-yellow-600 font-medium">지각 {attendanceSummary.지각}</span>
                    <span className="text-red-600 font-medium">결석 {attendanceSummary.결석}</span>
                    <span className="text-muted-foreground">/ 총 {mergedRecords.length}명</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground mr-1">일괄:</span>
                    <button
                        onClick={() => handleBatchAttendance('출석')}
                        className="px-2 py-1 text-xs rounded border bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition"
                    >
                        전원 출석
                    </button>
                    {dirty && (
                        <Button size="sm" onClick={handleSave} disabled={saving} className="ml-2">
                            <Check className="w-3.5 h-3.5 mr-1" />
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
                            className="flex items-center justify-between py-2 px-3 rounded-lg border bg-white hover:bg-accent/30 transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                    {record.studentName.charAt(0)}
                                </div>
                                <span className="text-sm font-medium">{record.studentName}</span>
                                {/* 출석부 체크인 시간 표시 */}
                                {fromAttendancePage && storeEntry.checkedInAt && (
                                    <span className="text-[11px] text-green-500 bg-green-50 px-1.5 py-0.5 rounded">
                                        🕐 {storeEntry.checkedInAt} 출석부 체크인
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {attendanceOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleAttendanceChange(record.studentId, opt.value)}
                                        className={`px-2 py-1 text-xs rounded-md border transition-all flex items-center gap-1 ${record.attendance === opt.value
                                            ? opt.color + ' font-semibold shadow-sm'
                                            : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                                            }`}
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

