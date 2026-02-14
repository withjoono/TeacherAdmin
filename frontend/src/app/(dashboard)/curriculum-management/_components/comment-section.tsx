"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle } from "lucide-react";
import type { LessonComment } from "@/lib/api/curriculum";
import { getComments, addComment } from "@/lib/api/curriculum";

interface CommentSectionProps {
    lessonRecordId: number;
}

const roleStyles: Record<string, { bg: string; align: string; bubble: string; badge: string }> = {
    '선생님': {
        bg: 'bg-blue-50',
        align: 'items-end',
        bubble: 'bg-blue-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm',
        badge: 'bg-blue-100 text-blue-700',
    },
    '학부모': {
        bg: 'bg-green-50',
        align: 'items-start',
        bubble: 'bg-white border border-green-200 text-foreground rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-sm',
        badge: 'bg-green-100 text-green-700',
    },
    '학생': {
        bg: 'bg-purple-50',
        align: 'items-start',
        bubble: 'bg-white border border-purple-200 text-foreground rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-sm',
        badge: 'bg-purple-100 text-purple-700',
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
        <div className="flex flex-col h-full">
            {/* 헤더 */}
            <div className="flex items-center gap-2 pb-3 border-b mb-3">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">코멘트</span>
                <span className="text-xs text-muted-foreground">
                    (선생님, 학부모, 학생 참여)
                </span>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-3 max-h-[300px] min-h-[120px]">
                {loading ? (
                    <p className="text-sm text-muted-foreground text-center py-4">로딩 중...</p>
                ) : comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
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
                                className={`flex flex-col ${isTeacher ? 'items-end' : 'items-start'}`}
                            >
                                {/* 이름 + 역할 */}
                                <div className={`flex items-center gap-1.5 mb-1 ${isTeacher ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-xs font-medium">{comment.author}</span>
                                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${style.badge}`}>
                                        {authorRole}
                                    </span>
                                </div>
                                {/* 말풍선 */}
                                <div className={`max-w-[80%] px-3.5 py-2.5 text-sm shadow-sm ${style.bubble}`}>
                                    {comment.content}
                                </div>
                                <span className="text-[10px] text-muted-foreground mt-1">
                                    {formatTime(comment.createdAt)}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* 입력 */}
            <div className="flex items-center gap-2 pt-3 border-t">
                <Input
                    placeholder="코멘트를 입력하세요..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                />
                <Button
                    size="sm"
                    onClick={handleSend}
                    disabled={!message.trim() || sending}
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
