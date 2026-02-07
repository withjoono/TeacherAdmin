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
import type { CreateLessonPlanDto } from "@/lib/api/curriculum";

interface LessonPlanFormProps {
    classId: string;
    onSubmit: (data: CreateLessonPlanDto) => void;
    isLoading?: boolean;
}

export function LessonPlanForm({ classId, onSubmit, isLoading }: LessonPlanFormProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [subject, setSubject] = useState("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [week, setWeek] = useState(1);

    const handleSubmit = () => {
        if (!title || !subject || !scheduledDate) return;
        onSubmit({
            classId,
            title,
            description: description || undefined,
            subject,
            scheduledDate,
            week,
        });
        // Reset
        setTitle("");
        setDescription("");
        setSubject("");
        setScheduledDate("");
        setWeek(1);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    수업 계획 추가
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>새 수업 계획 추가</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="lesson-title">수업 제목 *</Label>
                        <Input
                            id="lesson-title"
                            placeholder="예: 이차방정식"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lesson-subject">과목 *</Label>
                        <Input
                            id="lesson-subject"
                            placeholder="예: 수학"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="lesson-date">수업 날짜 *</Label>
                            <Input
                                id="lesson-date"
                                type="date"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lesson-week">주차</Label>
                            <Input
                                id="lesson-week"
                                type="number"
                                min={1}
                                value={week}
                                onChange={(e) => setWeek(parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lesson-desc">설명</Label>
                        <Input
                            id="lesson-desc"
                            placeholder="수업 내용에 대한 설명"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">취소</Button>
                    </DialogClose>
                    <Button
                        onClick={handleSubmit}
                        disabled={!title || !subject || !scheduledDate || isLoading}
                    >
                        {isLoading ? "추가 중..." : "추가"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
