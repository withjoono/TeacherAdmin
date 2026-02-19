"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    MessageSquare,
    Send,
    Loader2,
    Users,
    Search,
    ChevronRight,
} from "lucide-react";
import { getMyArenaClasses } from "@/lib/api/classes";
import type { ArenaClass } from "@/lib/api/classes";
import {
    getClassStudents,
    getPrivateComments,
    createPrivateComment,
} from "@/lib/api/teacher";
import type { StudentInfo, PrivateComment } from "@/lib/api/teacher";

// ================================
// 메인 페이지
// ================================
export default function CommentsPage() {
    const [classes, setClasses] = useState<ArenaClass[]>([]);
    const [students, setStudents] = useState<
        Array<StudentInfo & { className: string }>
    >([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // 선택된 학생
    const [selectedStudent, setSelectedStudent] = useState<
        (StudentInfo & { className: string }) | null
    >(null);

    // 댓글
    const [comments, setComments] = useState<PrivateComment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 클래스 & 학생 로드
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const classData = await getMyArenaClasses();
                setClasses(classData || []);

                const allStudents: Array<StudentInfo & { className: string }> = [];
                for (const cls of classData || []) {
                    const studs = await getClassStudents(String(cls.id));
                    for (const s of studs || []) {
                        allStudents.push({ ...s, className: cls.name });
                    }
                }
                setStudents(allStudents);
            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // 댓글 로드
    const fetchComments = useCallback(async (studentId: string) => {
        try {
            setCommentsLoading(true);
            const data = await getPrivateComments(studentId);
            setComments(data || []);
        } catch (err) {
            console.error("Failed to fetch comments:", err);
            setComments([]);
        } finally {
            setCommentsLoading(false);
        }
    }, []);

    // 학생 선택
    const handleSelectStudent = (student: StudentInfo & { className: string }) => {
        setSelectedStudent(student);
        fetchComments(student.id);
    };

    // 스크롤 하단 이동
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    // 메시지 전송
    const handleSend = async () => {
        if (!newMessage.trim() || !selectedStudent) return;
        try {
            setSending(true);
            await createPrivateComment({
                studentId: selectedStudent.id,
                content: newMessage.trim(),
            });
            setNewMessage("");
            fetchComments(selectedStudent.id);
        } catch (err) {
            console.error("Failed to send message:", err);
            alert("메시지 전송에 실패했습니다.");
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

    // 검색 필터
    const filteredStudents = students.filter(
        (s) =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.className.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col">
                <Header title="비공개 코멘트" />
                <div className="flex-1 flex items-center justify-center p-6">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <Header title="비공개 코멘트" />

            <div className="flex-1 p-6">
                <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-180px)]">
                    {/* 좌측: 학생 목록 */}
                    <Card className="lg:col-span-1 flex flex-col overflow-hidden">
                        <CardHeader className="pb-3 flex-shrink-0">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="w-4 h-4" />
                                학생 선택
                            </CardTitle>
                            <div className="relative mt-2">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="이름 또는 반 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-9"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-3">
                            {filteredStudents.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredStudents.map((student) => (
                                        <button
                                            key={student.id}
                                            onClick={() => handleSelectStudent(student)}
                                            className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between ${selectedStudent?.id === student.id
                                                    ? "bg-primary/10 border border-primary/30"
                                                    : "hover:bg-accent/50"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{student.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {student.className}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-sm text-muted-foreground py-8">
                                    {searchTerm ? "검색 결과가 없습니다" : "학생이 없습니다"}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 우측: 채팅 */}
                    <Card className="lg:col-span-2 flex flex-col overflow-hidden">
                        {selectedStudent ? (
                            <>
                                {/* 채팅 헤더 */}
                                <CardHeader className="pb-3 flex-shrink-0 border-b">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold">
                                            {selectedStudent.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{selectedStudent.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {selectedStudent.className} · 비공개 (학부모 공유)
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>

                                {/* 메시지 영역 */}
                                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {commentsLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : comments.length > 0 ? (
                                        <>
                                            {comments.map((comment) => {
                                                const isTeacher = comment.authorRole === "teacher";
                                                return (
                                                    <div
                                                        key={comment.id}
                                                        className={`flex ${isTeacher ? "justify-end" : "justify-start"
                                                            }`}
                                                    >
                                                        <div
                                                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isTeacher
                                                                    ? "bg-primary text-primary-foreground rounded-tr-md"
                                                                    : "bg-muted rounded-tl-md"
                                                                }`}
                                                        >
                                                            <p className="whitespace-pre-wrap">
                                                                {comment.content}
                                                            </p>
                                                            <p
                                                                className={`text-[10px] mt-1 ${isTeacher
                                                                        ? "text-primary-foreground/60"
                                                                        : "text-muted-foreground"
                                                                    }`}
                                                            >
                                                                {comment.createdAt
                                                                    ? new Date(comment.createdAt).toLocaleString(
                                                                        "ko-KR",
                                                                        {
                                                                            month: "short",
                                                                            day: "numeric",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        }
                                                                    )
                                                                    : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
                                            <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
                                            <p className="text-sm">
                                                아직 메시지가 없습니다
                                            </p>
                                            <p className="text-xs">
                                                아래에서 첫 메시지를 보내보세요
                                            </p>
                                        </div>
                                    )}
                                </CardContent>

                                {/* 입력 영역 */}
                                <div className="flex-shrink-0 border-t p-4">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="메시지를 입력하세요..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            className="flex-1"
                                            disabled={sending}
                                        />
                                        <Button
                                            onClick={handleSend}
                                            disabled={sending || !newMessage.trim()}
                                            size="icon"
                                        >
                                            {sending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        이 메시지는 해당 학생과 학부모만 볼 수 있습니다
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                                <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                                <p className="font-medium">학생을 선택하세요</p>
                                <p className="text-sm">
                                    왼쪽에서 학생을 선택하면 대화가 시작됩니다
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
