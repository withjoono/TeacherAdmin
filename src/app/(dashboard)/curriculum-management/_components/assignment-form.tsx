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
import type { CreateAssignmentDto } from "@/lib/api/curriculum";

interface AssignmentFormProps {
    classId: string;
    onSubmit: (data: CreateAssignmentDto) => void;
    isLoading?: boolean;
}

export function AssignmentForm({ classId, onSubmit, isLoading }: AssignmentFormProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [subject, setSubject] = useState("");
    const [dueDate, setDueDate] = useState("");

    const handleSubmit = () => {
        if (!title || !subject || !dueDate) return;
        onSubmit({
            classId,
            title,
            description: description || undefined,
            subject,
            dueDate,
        });
        setTitle("");
        setDescription("");
        setSubject("");
        setDueDate("");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    새 과제 추가
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>새 과제 추가</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="assignment-title">과제 제목 *</Label>
                        <Input
                            id="assignment-title"
                            placeholder="예: 이차방정식 연습문제"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="assignment-subject">과목 *</Label>
                        <Input
                            id="assignment-subject"
                            placeholder="예: 수학"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="assignment-due">마감일 *</Label>
                        <Input
                            id="assignment-due"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="assignment-desc">설명</Label>
                        <Input
                            id="assignment-desc"
                            placeholder="과제 내용에 대한 설명"
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
                        disabled={!title || !subject || !dueDate || isLoading}
                    >
                        {isLoading ? "추가 중..." : "추가"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
