"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  ListChecks,
  Wand2,
  Table2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  createTeacherExam,
  type QuestionType,
} from "@/lib/api/teacher-exam";

interface WizardQuestion {
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

const STEPS = [
  { n: 1, label: "기본 정보", icon: ClipboardList },
  { n: 2, label: "문항 수", icon: ListChecks },
  { n: 3, label: "일괄 설정", icon: Wand2 },
  { n: 4, label: "문항 입력", icon: Table2 },
  { n: 5, label: "검토·발행", icon: CheckCircle2 },
];

const GRADES = ["중1", "중2", "중3", "고1", "고2", "고3"];

export default function ExamBuilderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // 기본 정보
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");

  // 문항
  const [count, setCount] = useState(20);
  const [questions, setQuestions] = useState<WizardQuestion[]>([]);
  const [bulkAnswers, setBulkAnswers] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalScore = questions.reduce((s, q) => s + (q.score || 0), 0);

  // ---- 문항 생성 ----
  const generateQuestions = () => {
    const n = Math.max(1, Math.min(100, count));
    setQuestions(
      Array.from({ length: n }, (_, i) => ({
        questionNumber: i + 1,
        questionType: "objective" as QuestionType,
        score: 0,
        answer: 1,
        answerText: "",
        choiceCount: 5,
      })),
    );
    setCount(n);
    setStep(3);
  };

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

  const updateQuestion = (idx: number, patch: Partial<WizardQuestion>) =>
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));

  // ---- 저장 ----
  const handleSubmit = async (status: "draft" | "published") => {
    if (!name.trim()) {
      setError("시험 이름을 입력해주세요.");
      setStep(1);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createTeacherExam({
        name: name.trim(),
        grade: grade || undefined,
        subject: subject.trim() || undefined,
        dueDate: dueDate || undefined,
        status,
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

  // 발행 가능 여부 검증
  const missingAnswers = questions.filter(
    (q) =>
      (q.questionType === "objective" && !q.answer) ||
      (q.questionType === "short" && !q.answerText.trim()),
  ).length;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="새 시험 출제"
        description="문항 수와 기본값을 정하면 문항이 자동 생성됩니다. 달라지는 부분만 수정하세요."
        actions={
          <Button variant="outline" onClick={() => router.push("/exams")}>
            목록으로
          </Button>
        }
      />

      {/* 스텝 표시 */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-xl border bg-card p-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = s.n === step;
          const done = s.n < step;
          return (
            <div key={s.n} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium",
                  active
                    ? "bg-primary/10 text-primary"
                    : done
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ===== STEP 1 ===== */}
      {step === 1 && (
        <div className="space-y-4 rounded-xl border bg-card p-5">
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
        </div>
      )}

      {/* ===== STEP 2 ===== */}
      {step === 2 && (
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <Field label="총 문항 수">
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
              className="w-32 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </Field>
          <p className="text-xs text-muted-foreground">
            입력한 수만큼 문항이 자동 생성됩니다. 다음 단계에서 유형·배점·정답을
            일괄로 채울 수 있습니다.
          </p>
          {questions.length > 0 && (
            <p className="text-xs text-amber-600">
              ⚠ 문항을 다시 생성하면 입력한 문항 내용이 초기화됩니다.
            </p>
          )}
        </div>
      )}

      {/* ===== STEP 3 ===== */}
      {step === 3 && (
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            한 번의 클릭으로 전체 문항에 적용됩니다. 예외는 다음 단계에서 수정하세요.
          </p>
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
          <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            현재 합계 배점: <strong className="text-foreground">{totalScore}점</strong> ·{" "}
            문항 {questions.length}개
          </div>
        </div>
      )}

      {/* ===== STEP 4 ===== */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="space-y-2 rounded-xl border bg-card p-4">
            <label className="text-sm font-medium">정답 일괄 입력</label>
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
            <p className="text-[11px] text-muted-foreground">
              앞에서부터 순서대로 채워집니다. 객관식은 번호, 단답형은 텍스트로 들어갑니다.
            </p>
          </div>

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
                      <select
                        value={q.questionType}
                        onChange={(e) =>
                          updateQuestion(idx, {
                            questionType: e.target.value as QuestionType,
                          })
                        }
                        className="rounded-md border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                      >
                        {(["objective", "short", "essay"] as QuestionType[]).map((t) => (
                          <option key={t} value={t}>
                            {TYPE_LABEL[t]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="number"
                        min={0}
                        value={q.score}
                        onChange={(e) =>
                          updateQuestion(idx, {
                            score: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="w-16 rounded-md border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      {q.questionType === "objective" && (
                        <select
                          value={q.answer}
                          onChange={(e) =>
                            updateQuestion(idx, {
                              answer: parseInt(e.target.value, 10),
                            })
                          }
                          className="rounded-md border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                        >
                          {Array.from({ length: q.choiceCount }, (_, i) => i + 1).map(
                            (n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ),
                          )}
                        </select>
                      )}
                      {q.questionType === "short" && (
                        <input
                          value={q.answerText}
                          onChange={(e) =>
                            updateQuestion(idx, { answerText: e.target.value })
                          }
                          placeholder="정답 입력"
                          className="w-40 rounded-md border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                        />
                      )}
                      {q.questionType === "essay" && (
                        <span className="text-xs text-muted-foreground">
                          수동 채점
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      {q.questionType === "objective" ? (
                        <select
                          value={q.choiceCount}
                          onChange={(e) =>
                            updateQuestion(idx, {
                              choiceCount: parseInt(e.target.value, 10),
                            })
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
                        <span className="text-xs text-muted-foreground">—</span>
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
        </div>
      )}

      {/* ===== STEP 5 ===== */}
      {step === 5 && (
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold">검토</h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <Review label="시험 이름" value={name || "(미입력)"} />
            <Review label="학년 · 과목" value={`${grade || "-"} · ${subject || "-"}`} />
            <Review label="문항 수" value={`${questions.length}개`} />
            <Review label="합계 배점" value={`${totalScore}점`} />
            <Review label="응시 마감" value={dueDate || "제한 없음"} />
            <Review
              label="문항 구성"
              value={
                (["objective", "short", "essay"] as QuestionType[])
                  .map(
                    (t) =>
                      `${TYPE_LABEL[t]} ${questions.filter((q) => q.questionType === t).length}`,
                  )
                  .join(" · ")
              }
            />
          </dl>
          {missingAnswers > 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                정답이 비어 있는 문항이 {missingAnswers}개 있습니다. 임시저장 후
                나중에 채울 수 있습니다.
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              onClick={() => handleSubmit("published")}
              disabled={saving || missingAnswers > 0}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              발행하기
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit("draft")}
              disabled={saving}
            >
              임시저장
            </Button>
          </div>
        </div>
      )}

      {/* ===== 하단 내비게이션 ===== */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </Button>
        {step === 2 ? (
          <Button onClick={generateQuestions}>
            문항 생성
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : step < 5 ? (
          <Button
            onClick={() => setStep((s) => Math.min(5, s + 1))}
            disabled={step === 1 && !name.trim()}
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <span />
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

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary px-3 py-2">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
