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
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <PageContainer className="space-y-6">
        <PageHeader title="비공개 코멘트" description="학생/학부모와 1:1 메시지를 주고받으세요" />
        <Spinner full label="불러오는 중..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex h-[calc(100vh-2rem)] flex-col space-y-6">
      <PageHeader title="비공개 코멘트" description="학생/학부모와 1:1 메시지를 주고받으세요" />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* 좌측: 학생 목록 */}
        <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
          <div className="border-b p-4">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
              <Users className="h-4 w-4 text-primary" />
              학생 선택
            </h2>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="이름 또는 반 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredStudents.length > 0 ? (
              <div className="space-y-1">
                {filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors",
                      selectedStudent?.id === student.id
                        ? "bg-primary/10"
                        : "hover:bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{student.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {student.className}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {searchTerm ? "검색 결과가 없습니다" : "학생이 없습니다"}
              </div>
            )}
          </div>
        </div>

        {/* 우측: 채팅 영역 */}
        <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
          {selectedStudent ? (
            <>
              {/* 채팅 헤더 */}
              <div className="flex items-center gap-3 border-b p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">{selectedStudent.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedStudent.className} · 비공개 (학부모 공유)
                  </p>
                </div>
              </div>

              {/* 메시지 목록 */}
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted/40 p-6">
                {commentsLoading ? (
                  <div className="m-auto flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : comments.length > 0 ? (
                  <>
                    {comments.map((comment) => {
                      const isTeacher = comment.authorRole === "teacher";
                      return (
                        <div
                          key={comment.id}
                          className={cn("flex", isTeacher ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[75%] px-4 py-2.5 text-sm shadow-sm",
                              isTeacher
                                ? "rounded-[16px_16px_4px_16px] bg-primary text-primary-foreground"
                                : "rounded-[16px_16px_16px_4px] border bg-card text-foreground"
                            )}
                          >
                            <p className="m-0 whitespace-pre-wrap">{comment.content}</p>
                            <div
                              className={cn(
                                "mt-1 text-[10px]",
                                isTeacher
                                  ? "text-right text-primary-foreground/70"
                                  : "text-left text-muted-foreground"
                              )}
                            >
                              {comment.createdAt
                                ? new Date(comment.createdAt).toLocaleString("ko-KR", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="m-auto flex flex-col items-center text-muted-foreground">
                    <MessageSquare className="mb-3 h-12 w-12 opacity-20" />
                    <p className="text-sm">아직 메시지가 없습니다</p>
                    <p className="text-xs">아래에서 첫 메시지를 보내보세요</p>
                  </div>
                )}
              </div>

              {/* 입력 폼 */}
              <div className="border-t bg-card p-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="메시지를 입력하세요..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  이 메시지는 해당 학생과 학부모만 볼 수 있습니다
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="mb-4 h-16 w-16 opacity-10" />
              <p className="text-lg font-medium text-foreground">학생을 선택하세요</p>
              <p className="mt-1 text-sm">왼쪽에서 학생을 선택하면 대화가 시작됩니다</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
