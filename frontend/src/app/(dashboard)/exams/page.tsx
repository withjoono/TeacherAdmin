"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus, Send, Trash2, Users, Pencil, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  listTeacherExams,
  setTeacherExamStatus,
  deleteTeacherExam,
  type TeacherExamListItem,
} from "@/lib/api/teacher-exam";

const STATUS_META: Record<string, { label: string; className: string }> = {
  draft: { label: "임시저장", className: "bg-secondary text-muted-foreground ring-1 ring-border" },
  published: { label: "발행됨", className: "bg-emerald-100 text-emerald-700" },
  closed: { label: "마감", className: "bg-rose-100 text-rose-700" },
};

export default function ExamListPage() {
  const router = useRouter();
  const [exams, setExams] = useState<TeacherExamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setExams(await listTeacherExams());
    } catch (e: any) {
      setError(e?.response?.data?.message || "시험 목록을 불러오지 못했습니다.");
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handlePublish = async (id: number) => {
    setBusyId(id);
    try {
      await setTeacherExamStatus(id, "published");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "발행에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("이 시험을 삭제할까요?")) return;
    setBusyId(id);
    try {
      await deleteTeacherExam(id);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "삭제에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="시험 출제"
        description="직접 출제한 시험을 관리합니다. 학생은 담당 선생님 시험에서 응시합니다."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/exams/grading")}>
              <PenLine className="h-4 w-4" />
              주관식 채점
            </Button>
            <Button onClick={() => router.push("/exams/new")}>
              <Plus className="h-4 w-4" />
              새 시험 출제
            </Button>
          </div>
        }
      />

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <Spinner full label="시험 목록을 불러오는 중..." />
      ) : exams.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="출제한 시험이 없습니다"
          description="새 시험을 출제하면 여기에 표시됩니다."
          action={
            <Button onClick={() => router.push("/exams/new")}>
              <Plus className="h-4 w-4" />
              새 시험 출제
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const sm = STATUS_META[exam.status] ?? STATUS_META.draft;
            return (
              <div
                key={exam.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {exam.name}
                    </h3>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        sm.className,
                      )}
                    >
                      {sm.label}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {exam.grade && <span>{exam.grade}</span>}
                    <span>{exam.totalQuestions}문항</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      응시 {exam.submissionCount}명
                    </span>
                    {exam.dueDate && (
                      <span>마감 {new Date(exam.dueDate).toLocaleDateString("ko-KR")}</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {exam.status === "draft" && exam.submissionCount === 0 && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === exam.id}
                        onClick={() => router.push(`/exams/edit?id=${exam.id}`)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        편집
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === exam.id}
                        onClick={() => handlePublish(exam.id)}
                      >
                        <Send className="h-3.5 w-3.5" />
                        발행
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId === exam.id || exam.submissionCount > 0}
                    onClick={() => handleDelete(exam.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
