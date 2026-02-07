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
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import type { LessonPlan, UpdateLessonPlanDto } from "@/lib/api/curriculum";

interface ProgressEditDialogProps {
    lesson: LessonPlan | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (id: number, data: UpdateLessonPlanDto) => void;
    isLoading?: boolean;
}

export function ProgressEditDialog({
    lesson,
    open,
    onOpenChange,
    onSubmit,
    isLoading,
}: ProgressEditDialogProps) {
    const [progress, setProgress] = useState(lesson?.progress ?? 0);
    const [title, setTitle] = useState(lesson?.title ?? "");
    const [description, setDescription] = useState(lesson?.description ?? "");

    // Sync when lesson changes
    if (lesson && title !== lesson.title && !open) {
        // will be set on open
    }

    const handleOpen = (isOpen: boolean) => {
        if (isOpen && lesson) {
            setProgress(lesson.progress);
            setTitle(lesson.title);
            setDescription(lesson.description ?? "");
        }
        onOpenChange(isOpen);
    };

    const handleSubmit = () => {
        if (!lesson) return;
        onSubmit(lesson.id, {
            title,
            description: description || undefined,
            progress,
        });
    };

    if (!lesson) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>수업 진도 수정</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-title">수업 제목</Label>
                        <Input
                            id="edit-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-desc">설명</Label>
                        <Input
                            id="edit-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-progress">진도율 (%)</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="edit-progress"
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                value={progress}
                                onChange={(e) => setProgress(parseInt(e.target.value))}
                                className="flex-1"
                            />
                            <span className="text-lg font-bold w-14 text-right">{progress}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${progress >= 100
                                        ? "bg-green-500"
                                        : progress > 0
                                            ? "bg-blue-500"
                                            : "bg-gray-300"
                                    }`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">취소</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "저장 중..." : "저장"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
