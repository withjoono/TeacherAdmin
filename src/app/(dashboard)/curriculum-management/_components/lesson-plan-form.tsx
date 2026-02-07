"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { CreateLessonRecordDto } from "@/lib/api/curriculum";

interface LessonRecordFormProps {
    classId: string;
    onSubmit: (data: CreateLessonRecordDto) => void;
    isLoading?: boolean;
}

export function LessonRecordForm({ classId, onSubmit, isLoading }: LessonRecordFormProps) {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [content, setContent] = useState("");
    const [assignmentResult, setAssignmentResult] = useState("");
    const [nextAssignment, setNextAssignment] = useState("");
    const [testResult, setTestResult] = useState("");

    const handleSubmit = () => {
        if (!date || !time || !content) return;
        onSubmit({
            classId,
            date,
            time,
            content,
            assignmentResult: assignmentResult || undefined,
            nextAssignment: nextAssignment || undefined,
            testResult: testResult || undefined,
        });
        setDate(""); setTime(""); setContent("");
        setAssignmentResult(""); setNextAssignment(""); setTestResult("");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    수업 기록 추가
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>새 수업 기록 작성</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rec-date">날짜 *</Label>
                            <Input id="rec-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rec-time">시간 *</Label>
                            <Input id="rec-time" placeholder="예: 14:00~16:00" value={time} onChange={(e) => setTime(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rec-content">수업내용 *</Label>
                        <textarea
                            id="rec-content"
                            rows={4}
                            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="오늘 수업에서 다룬 내용을 입력하세요"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rec-ar">과제 결과</Label>
                        <Input id="rec-ar" placeholder="지난 과제에 대한 결과" value={assignmentResult} onChange={(e) => setAssignmentResult(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rec-na">다음 과제</Label>
                        <Input id="rec-na" placeholder="다음 시간까지 해올 과제" value={nextAssignment} onChange={(e) => setNextAssignment(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rec-tr">테스트 결과</Label>
                        <Input id="rec-tr" placeholder="시험/쪽지시험 결과" value={testResult} onChange={(e) => setTestResult(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">취소</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={!date || !time || !content || isLoading}>
                        {isLoading ? "저장 중..." : "저장"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
