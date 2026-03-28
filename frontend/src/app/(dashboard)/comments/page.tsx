"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
            <div className="gb-page-dashboard gb-stack gb-stack-6" style={{ paddingTop: "var(--space-10)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
                    <Loader2 style={{ width: 32, height: 32, color: "var(--color-text-disabled)", animation: "spin 1s linear infinite" }} />
                </div>
            </div>
        );
    }

    return (
        <div className="gb-page-dashboard gb-stack gb-stack-8" style={{ paddingTop: "var(--space-10)", height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* 페이지 헤더 */}
            <div className="gb-page-header" style={{ marginBottom: 0 }}>
                <h1 className="gb-page-title">비공개 코멘트</h1>
                <p className="gb-page-desc">학생/학부모와 1:1 메시지를 주고받으세요</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "var(--space-6)", flex: 1, minHeight: 0 }}>
                {/* 좌측: 학생 목록 */}
                <div className="gb-card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--color-border-light)" }}>
                        <h2 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", display: 'flex', alignItems: 'center', gap: '8px', marginBottom: "var(--space-3)" }}>
                            <Users style={{ width: 16, height: 16, color: 'var(--color-primary)' }} />
                            학생 선택
                        </h2>
                        <div style={{ position: "relative" }}>
                            <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--color-text-tertiary)" }} />
                            <input
                                placeholder="이름 또는 반 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="gb-input"
                                style={{ paddingLeft: "36px", height: "36px" }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-2)" }}>
                        {filteredStudents.length > 0 ? (
                            <div className="gb-stack gb-stack-1">
                                {filteredStudents.map((student) => (
                                    <button
                                        key={student.id}
                                        onClick={() => handleSelectStudent(student)}
                                        style={{
                                            width: "100%", textAlign: "left", padding: "var(--space-3)", borderRadius: "var(--radius-md)", transition: "all var(--transition-short)", display: "flex", alignItems: "center", justifyContent: "space-between", border: "none", cursor: "pointer",
                                            background: selectedStudent?.id === student.id ? "var(--color-primary-50, var(--color-bg-secondary))" : "transparent"
                                        }}
                                        onMouseEnter={(e) => { if (selectedStudent?.id !== student.id) e.currentTarget.style.background = "var(--color-bg-secondary)" }}
                                        onMouseLeave={(e) => { if (selectedStudent?.id !== student.id) e.currentTarget.style.background = "transparent" }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "var(--text-sm)", fontWeight: "var(--weight-bold)", flexShrink: 0 }}>
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text)" }}>{student.name}</p>
                                                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "2px" }}>
                                                    {student.className}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight style={{ width: 16, height: 16, color: "var(--color-text-tertiary)" }} />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="gb-empty-state" style={{ padding: "var(--space-8) 0" }}>
                                {searchTerm ? "검색 결과가 없습니다" : "학생이 없습니다"}
                            </div>
                        )}
                    </div>
                </div>

                {/* 우측: 채팅 영역 */}
                <div className="gb-card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
                    {selectedStudent ? (
                        <>
                            {/* 채팅 헤더 */}
                            <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--color-border-light)", display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>
                                    {selectedStudent.name.charAt(0)}
                                </div>
                                <div>
                                    <p style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>{selectedStudent.name}</p>
                                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
                                        {selectedStudent.className} · 비공개 (학부모 공유)
                                    </p>
                                </div>
                            </div>

                            {/* 메시지 목록 */}
                            <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)", background: "var(--color-bg-light)" }}>
                                {commentsLoading ? (
                                    <div style={{ display: "flex", justifyItems: "center", padding: "var(--space-8) 0", margin: "auto" }}>
                                        <Loader2 style={{ width: 24, height: 24, color: "var(--color-text-disabled)", animation: "spin 1s linear infinite" }} />
                                    </div>
                                ) : comments.length > 0 ? (
                                    <>
                                        {comments.map((comment) => {
                                            const isTeacher = comment.authorRole === "teacher";
                                            return (
                                                <div
                                                    key={comment.id}
                                                    style={{ display: "flex", justifyContent: isTeacher ? "flex-end" : "flex-start" }}
                                                >
                                                    <div
                                                        style={{
                                                            maxWidth: "75%", padding: "10px 16px", fontSize: "var(--text-sm)",
                                                            background: isTeacher ? "var(--color-primary)" : "white",
                                                            color: isTeacher ? "white" : "var(--color-text)",
                                                            borderRadius: isTeacher ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                                                        }}
                                                    >
                                                        <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                                                            {comment.content}
                                                        </p>
                                                        <div style={{ fontSize: "10px", marginTop: "4px", textAlign: isTeacher ? "right" : "left", color: isTeacher ? "rgba(255,255,255,0.7)" : "var(--color-text-tertiary)" }}>
                                                            {comment.createdAt ? new Date(comment.createdAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                ) : (
                                    <div style={{ margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", color: "var(--color-text-tertiary)" }}>
                                        <MessageSquare style={{ width: 48, height: 48, marginBottom: "var(--space-3)", opacity: 0.2 }} />
                                        <p style={{ fontSize: "var(--text-sm)" }}>아직 메시지가 없습니다</p>
                                        <p style={{ fontSize: "var(--text-xs)" }}>아래에서 첫 메시지를 보내보세요</p>
                                    </div>
                                )}
                            </div>

                            {/* 입력 폼 */}
                            <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--color-border-light)", background: "white" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <input
                                        placeholder="메시지를 입력하세요..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="gb-input"
                                        disabled={sending}
                                        style={{ height: "40px" }}
                                    />
                                    <button
                                        className="gb-btn gb-btn-primary"
                                        onClick={handleSend}
                                        disabled={sending || !newMessage.trim()}
                                        style={{ width: "40px", height: "40px", padding: 0, justifyContent: "center", borderRadius: "var(--radius-md)" }}
                                    >
                                        {sending ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Send style={{ width: 16, height: 16 }} />}
                                    </button>
                                </div>
                                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "6px" }}>
                                    이 메시지는 해당 학생과 학부모만 볼 수 있습니다
                                </p>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--color-text-tertiary)" }}>
                            <MessageSquare style={{ width: 64, height: 64, marginBottom: "var(--space-4)", opacity: 0.1 }} />
                            <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-medium)", color: "var(--color-text-secondary)" }}>학생을 선택하세요</p>
                            <p style={{ fontSize: "var(--text-sm)", marginTop: "4px" }}>왼쪽에서 학생을 선택하면 대화가 시작됩니다</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
