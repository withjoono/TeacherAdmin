"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PenLine,
  Loader2,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  getPendingGrading,
  getSubmissionDetail,
  gradeAnswer,
  type PendingGradingItem,
  type SubmissionDetail,
} from "@/lib/api/teacher-exam";

export default function ExamGradingPage() {
  const [pending, setPending] = useState<PendingGradingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [scores, setScores] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const loadPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPending(await getPendingGrading());
    } catch (e: any) {
      setError(e?.response?.data?.message || "채점 대기 목록을 불러오지 못했습니다.");
      setPending([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const openSubmission = async (submissionId: number) => {
    setSelected(submissionId);
    setDetail(null);
    setDetailLoading(true);
    try {
      const d = await getSubmissionDetail(submissionId);
      setDetail(d);
      const init: Record<number, string> = {};
      d.answers
        .filter((a) => a.questionType === "essay")
        .forEach((a) => {
          init[a.id] = String(a.earnedScore ?? 0);
        });
      setScores(init);
    } catch (e: any) {
      setError(e?.response?.data?.message || "제출 내역을 불러오지 못했습니다.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleGrade = async (answerId: number, maxScore: number) => {
    const raw = parseInt(scores[answerId] ?? "0", 10) || 0;
    const score = Math.max(0, Math.min(maxScore, raw));
    setSavingId(answerId);
    try {
      await gradeAnswer(answerId, score);
      if (selected) {
        const d = await getSubmissionDetail(selected);
        setDetail(d);
      }
      await loadPending();
    } catch (e: any) {
      setError(e?.response?.data?.message || "채점 저장에 실패했습니다.");
    } finally {
      setSavingId(null);
    }
  };

  const essayAnswers = detail?.answers.filter((a) => a.questionType === "essay") ?? [];

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="주관식 채점"
        description="자동채점되지 않는 주관식 답안을 검토하고 점수를 부여합니다."
      />

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <Spinner full label="채점 대기 목록을 불러오는 중..." />
      ) : pending.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="채점할 주관식이 없습니다"
          description="학생이 주관식 시험을 제출하면 여기에 표시됩니다."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          {/* 채점 대기 목록 */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              채점 대기 {pending.length}건
            </h2>
            {pending.map((p) => (
              <button
                key={p.submissionId}
                type="button"
                onClick={() => openSubmission(p.submissionId)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                  selected === p.submissionId
                    ? "border-primary/40 bg-primary/5"
                    : "bg-card hover:bg-accent",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {p.studentName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{p.examName}</p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                  {p.ungradedCount}문항
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>

          {/* 채점 패널 */}
          <div>
            {!selected ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed bg-card py-16 text-sm text-muted-foreground">
                왼쪽에서 채점할 제출을 선택하세요.
              </div>
            ) : detailLoading ? (
              <Spinner label="불러오는 중..." />
            ) : detail ? (
              <div className="space-y-4">
                <div className="rounded-xl border bg-card p-4">
                  <h3 className="text-sm font-semibold">
                    {detail.studentName} · {detail.examName}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    현재 점수 {detail.earnedScore} / {detail.totalScore}점 · 정답{" "}
                    {detail.correctCount}문항
                  </p>
                </div>

                {essayAnswers.map((a) => (
                  <div key={a.id} className="rounded-xl border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {a.questionNumber}번 · 주관식
                      </span>
                      <span className="text-xs text-muted-foreground">
                        배점 {a.maxScore}점
                      </span>
                    </div>
                    <div className="mt-2 rounded-lg bg-secondary px-3 py-2 text-sm">
                      {a.answerText ? (
                        <p className="whitespace-pre-wrap">{a.answerText}</p>
                      ) : (
                        <p className="text-muted-foreground">(미작성)</p>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <label className="text-xs text-muted-foreground">부여 점수</label>
                      <input
                        type="number"
                        min={0}
                        max={a.maxScore}
                        value={scores[a.id] ?? "0"}
                        onChange={(e) =>
                          setScores((s) => ({ ...s, [a.id]: e.target.value }))
                        }
                        className="w-20 rounded-md border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                      />
                      <span className="text-xs text-muted-foreground">
                        / {a.maxScore}
                      </span>
                      <Button
                        size="sm"
                        disabled={savingId === a.id}
                        onClick={() => handleGrade(a.id, a.maxScore)}
                      >
                        {savingId === a.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <PenLine className="h-3.5 w-3.5" />
                        )}
                        {a.isGraded ? "수정" : "채점"}
                      </Button>
                      {a.isGraded && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          채점됨 ({a.earnedScore}점)
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {essayAnswers.length === 0 && (
                  <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
                    이 제출에는 주관식 문항이 없습니다.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
