"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle } from "lucide-react";
import type { LessonComment } from "@/lib/api/curriculum";
import { getComments, addComment } from "@/lib/api/curriculum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
    lessonRecordId: number;
}

const roleStyles: Record<string, { bubble: string; badge: string }> = {
    '선생님': {
        bubble: 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm',
        badge: 'bg-primary/10 text-primary',
    },
    '학부모': {
        bubble: 'bg-card border text-foreground rounded-2xl rounded-bl-sm',
        badge: 'bg-emerald-100 text-emerald-700',
    },
    '학생': {
        bubble: 'bg-card border text-foreground rounded-2xl rounded-bl-sm',
        badge: 'bg-violet-100 text-violet-700',
    },
};

export function CommentSection({ lessonRecordId }: CommentSectionProps) {
    const [comments, setComments] = useState<LessonComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLoading(true);
        getComments(String(lessonRecordId))
            .then(setComments)
            .finally(() => setLoading(false));
    }, [lessonRecordId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            const newComment = await addComment(String(lessonRecordId), message.trim());
            setComments(prev => [...prev, newComment]);
            setMessage("");
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    return (
        <div className="flex h-full flex-col">
            {/* 헤더 */}
            <div className="mb-3 flex items-center gap-2 border-b pb-3">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">코멘트</span>
                <span className="text-xs text-muted-foreground">
                    (선생님, 학부모, 학생 참여)
                </span>
            </div>

            {/* 메시지 영역 */}
            <div className="max-h-[300px] min-h-[120px] flex-1 space-y-3 overflow-y-auto pb-3">
                {loading ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">로딩 중...</p>
                ) : comments.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        아직 코멘트가 없습니다. 첫 코멘트를 남겨보세요!
                    </p>
                ) : (
                    comments.map((comment) => {
                        const authorRole = comment.author || '선생님';
                        const style = roleStyles[authorRole] || roleStyles['학생'];
                        const isTeacher = authorRole === '선생님';

                        return (
                            <div
                                key={comment.id}
                                className={cn("flex flex-col", isTeacher ? "items-end" : "items-start")}
                            >
                                {/* 이름 + 역할 */}
                                <div className={cn("mb-1 flex items-center gap-1.5", isTeacher && "flex-row-reverse")}>
                                    <span className="text-xs font-medium text-foreground">{comment.author}</span>
                                    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", style.badge)}>
                                        {authorRole}
                                    </span>
                                </div>
                                {/* 말풍선 */}
                                <div className={cn("max-w-[80%] px-3.5 py-2.5 text-sm shadow-sm", style.bubble)}>
                                    {comment.content}
                                </div>
                                <span className="mt-1 text-[10px] text-muted-foreground">
                                    {formatTime(comment.createdAt)}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* 입력 */}
            <div className="flex items-center gap-2 border-t pt-3">
                <Input
                    placeholder="코멘트를 입력하세요..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                />
                <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!message.trim() || sending}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
