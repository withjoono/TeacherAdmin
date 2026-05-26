"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Loader2,
  AlertCircle,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  getTeacherExam,
  updateTeacherExam,
  type QuestionType,
  type TeacherExamDetail,
} from "@/lib/api/teacher-exam";

interface EditQuestion {
  questionNumber: number;
  questionType: QuestionType;
  score: number;
  answer: number;
  answerText: string;
  choiceCount: number;
}

const TYPE_LABEL: Record<QuestionType, string> = {
  objective: "객관식",
  short: "단답형",
  essay: "주관식",
};

const GRADES = ["중1", "중2", "중3", "고1", "고2", "고3"];

export default function ExamEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const examId = parseInt(id, 10);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<TeacherExamDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 기본 정보
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");

  // 문항
  const [questions, setQuestions] = useState<EditQuestion[]>([]);
  const [bulkAnswers, setBulkAnswers] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalScore = questions.reduce((s, q) => s + (q.score || 0), 0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getTeacherExam(examId);
        setExam(data);
        setName(data.name);
        setGrade(data.grade ?? "");
        setSubject(data.subject ?? "");
        setDueDate(
          data.dueDate ? new Date(data.dueDate).toISOString().split("T")[0] : "",
        );
        setQuestions(
          data.questions.map((q) => ({
            questionNumber: q.questionNumber,
            questionType: q.questionType as QuestionType,
            score: q.score,
            answer: q.answer ?? 1,
            answerText: q.answerText ?? "",
            choiceCount: q.choiceCount ?? 5,
          })),
        );
      } catch (e: any) {
        setLoadError(e?.response?.data?.message || "시험 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [examId]);

  // ---- 일괄 설정 ----
  const setAllType = (t: QuestionType) =>
    setQuestions((qs) => qs.map((q) => ({ ...q, questionType: t })));
  const setAllScore = (s: number) =>
    setQuestions((qs) => qs.map((q) => ({ ...q, score: s })));
  const setAllChoiceCount = (c: number) =>
    setQuestions((qs) => qs.map((q) => ({ ...q, choiceCount: c })));
  const distributeEvenly = () => {
    const n = questions.length;
    if (n === 0) return;
    const base = Math.floor(100 / n);
    const rem = 100 - base * n;
    setQuestions((qs) =>
      qs.map((q, i) => ({ ...q, score: base + (i < rem ? 1 : 0) })),
    );
  };
  const applyBulkAnswers = () => {
    const parts = bulkAnswers.trim().split(/[\s,]+/).filter(Boolean);
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i >= parts.length) return q;
        if (q.questionType === "objective") {
          const v = parseInt(parts[i], 10);
          return Number.isNaN(v) ? q : { ...q, answer: v };
        }
        return { ...q, answerText: parts[i] };
      }),
    );
  };

  const updateQuestion = (idx: number, patch: Partial<EditQuestion>) =>
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));

  // ---- 저장 ----
  const handleSave = async (status?: "draft" | "published") => {
    if (!name.trim()) {
      setError("시험 이름을 입력해주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateTeacherExam(examId, {
        name: name.trim(),
        grade: grade || undefined,
        subject: subject.trim() || undefined,
        dueDate: dueDate || undefined,
        status: status ?? (exam?.status as "draft" | "published") ?? "draft",
        questions: questions.map((q) => ({
          questionNumber: q.questionNumber,
          questionType: q.questionType,
          score: q.score,
          answer: q.questionType === "objective" ? q.answer : undefined,
          answerText:
            q.questionType !== "objective" ? q.answerText || undefined : undefined,
          choiceCount: q.questionType === "objective" ? q.choiceCount : undefined,
        })),
      });
      router.push("/exams");
    } catch (e: any) {
      setError(e?.response?.data?.message || "시험 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const missingAnswers = questions.filter(
    (q) =>
      (q.questionType === "objective" && !q.answer) ||
      (q.questionType === "short" && !q.answerText.trim()),
  ).length;

  if (loading) {
    return (
      <PageContainer>
        <Spinner full label="시험 정보를 불러오는 중..." />
      </PageContainer>
    );
  }

  if (loadError || !exam) {
    return (
      <PageContainer>
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{loadError ?? "시험을 찾을 수 없습니다."}</span>
        </div>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/exams")}>
          <ChevronLeft className="h-4 w-4" />
          목록으로
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="시험 수정"
        description={`「${exam.name}」을 편집합니다.`}
        actions={
          <Button variant="outline" onClick={() => router.push("/exams")}>
            <ChevronLeft className="h-4 w-4" />
            목록으로
          </Button>
        }
      />

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 기본 정보 */}
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold">기본 정보</h2>
        <Field label="시험 이름" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 3월 수학 단원평가"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="학년">
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            >
              <option value="">선택 안 함</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <Field label="과목">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="예: 수학"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </Field>
          <Field label="응시 마감일">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </Field>
        </div>
      </section>

      {/* 문항 편집 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            문항 ({questions.length}개)
          </h2>
        </div>

        {!false && (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Wand2 className="h-3.5 w-3.5" />
              일괄 설정
            </div>
            <div className="mt-3 space-y-3">
              <BulkGroup label="전체 문항 유형">
                {(["objective", "short", "essay"] as QuestionType[]).map((t) => (
                  <Button key={t} variant="outline" size="sm" onClick={() => setAllType(t)}>
                    전체 {TYPE_LABEL[t]}
                  </Button>
                ))}
              </BulkGroup>
              <BulkGroup label="전체 배점">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Button key={s} variant="outline" size="sm" onClick={() => setAllScore(s)}>
                    {s}점
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={distributeEvenly}>
                  100점 균등 분배
                </Button>
              </BulkGroup>
              <BulkGroup label="객관식 보기 수">
                {[4, 5].map((c) => (
                  <Button
                    key={c}
                    variant="outline"
                    size="sm"
                    onClick={() => setAllChoiceCount(c)}
                  >
                    {c}지선다
                  </Button>
                ))}
              </BulkGroup>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">정답 일괄 입력</p>
                <div className="flex flex-wrap gap-2">
                  <input
                    value={bulkAnswers}
                    onChange={(e) => setBulkAnswers(e.target.value)}
                    placeholder="공백 구분 — 예: 3 1 4 2 5 ..."
                    className="min-w-[240px] flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                  />
                  <Button variant="secondary" onClick={applyBulkAnswers}>
                    일괄 적용
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="px-3 py-2 text-left">번호</th>
                <th className="px-3 py-2 text-left">유형</th>
                <th className="px-3 py-2 text-left">배점</th>
                <th className="px-3 py-2 text-left">정답</th>
                <th className="px-3 py-2 text-left">보기 수</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr key={q.questionNumber} className="border-b last:border-0">
                  <td className="px-3 py-1.5 font-medium">{q.questionNumber}</td>
                  <td className="px-3 py-1.5">
                    {false ? (
                      <span className="text-sm">{TYPE_LABEL[q.questionType]}</span>
                    ) : (
                      <select
                        value={q.questionType}
                        onChange={(e) =>
                          updateQuestion(idx, { questionType: e.target.value as QuestionType })
                        }
                        className="rounded-md border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                      >
                        {(["objective", "short", "essay"] as QuestionType[]).map((t) => (
                          <option key={t} value={t}>
                            {TYPE_LABEL[t]}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    {false ? (
                      <span>{q.score}점</span>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        value={q.score}
                        onChange={(e) =>
                          updateQuestion(idx, { score: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-16 rounded-md border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                      />
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    {q.questionType === "objective" && !false && (
                      <select
                        value={q.answer}
                        onChange={(e) =>
                          updateQuestion(idx, { answer: parseInt(e.target.value, 10) })
                        }
                        className="rounded-md border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                      >
                        {Array.from({ length: q.choiceCount }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    )}
                    {q.questionType === "objective" && false && (
                      <span>{q.answer}번</span>
                    )}
                    {q.questionType === "short" && !false && (
                      <input
                        value={q.answerText}
                        onChange={(e) =>
                          updateQuestion(idx, { answerText: e.target.value })
                        }
                        placeholder="정답 입력"
                        className="w-40 rounded-md border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                      />
                    )}
                    {q.questionType === "short" && false && (
                      <span>{q.answerText || "—"}</span>
                    )}
                    {q.questionType === "essay" && (
                      <span className="text-xs text-muted-foreground">수동 채점</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    {q.questionType === "objective" && !false ? (
                      <select
                        value={q.choiceCount}
                        onChange={(e) =>
                          updateQuestion(idx, { choiceCount: parseInt(e.target.value, 10) })
                        }
                        className="rounded-md border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                      >
                        {[4, 5].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {q.questionType === "objective" ? `${q.choiceCount}지` : "—"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          합계 배점 <strong className="text-foreground">{totalScore}점</strong>
        </div>
      </section>

      {/* 저장 버튼 */}
      <div className="flex flex-wrap gap-2 pb-4">
        <Button
          onClick={() => handleSave("published")}
          disabled={saving || missingAnswers > 0}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          저장 및 발행
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSave("draft")}
          disabled={saving}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          임시저장
        </Button>
        {missingAnswers > 0 && (
          <p className="flex items-center gap-1 text-xs text-amber-600">
            <AlertCircle className="h-3.5 w-3.5" />
            정답 미입력 {missingAnswers}문항 — 임시저장 후 채울 수 있습니다.
          </p>
        )}
      </div>
    </PageContainer>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function BulkGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
