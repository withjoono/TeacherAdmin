"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Users, CheckCircle2, Clock, FileText } from "lucide-react";
import type { AssignmentSubmission } from "@/lib/api/curriculum";
import { getSubmissions } from "@/lib/api/curriculum";

interface SubmissionDetailProps {
    assignmentId: number | null;
    assignmentTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SubmissionDetail({
    assignmentId,
    assignmentTitle,
    open,
    onOpenChange,
}: SubmissionDetailProps) {
    const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && assignmentId) {
            setLoading(true);
            getSubmissions(assignmentId)
                .then(setSubmissions)
                .finally(() => setLoading(false));
        }
    }, [open, assignmentId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {assignmentTitle} - 제출 현황
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            로딩 중...
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Users className="w-10 h-10 mb-2 opacity-50" />
                            <p>제출된 과제가 없습니다</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* 요약 */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-center">
                                    <p className="text-sm text-muted-foreground">제출 인원</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {submissions.length}명
                                    </p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg text-center">
                                    <p className="text-sm text-muted-foreground">평균 점수</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {submissions.filter(s => s.grade).length > 0
                                            ? (
                                                submissions
                                                    .filter(s => s.grade)
                                                    .reduce((sum, s) => sum + (s.grade || 0), 0) /
                                                submissions.filter(s => s.grade).length
                                            ).toFixed(1)
                                            : "-"}
                                        점
                                    </p>
                                </div>
                            </div>

                            {/* 학생별 제출 목록 */}
                            {submissions.map((sub) => (
                                <div
                                    key={sub.id}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                            {sub.studentName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{sub.studentName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                제출: {sub.submittedAt}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {sub.grade !== undefined && sub.grade !== null ? (
                                            <div className="flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                <span className="font-semibold text-sm">{sub.grade}점</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-sm">미채점</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {submissions.some(s => s.feedback) && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm font-medium mb-2">피드백 현황</p>
                                    {submissions
                                        .filter(s => s.feedback)
                                        .map((sub) => (
                                            <div key={sub.id} className="mb-2 p-2 bg-muted/50 rounded text-sm">
                                                <span className="font-medium">{sub.studentName}:</span>{" "}
                                                <span className="text-muted-foreground">{sub.feedback}</span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
