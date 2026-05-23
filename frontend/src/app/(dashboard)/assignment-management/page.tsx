"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  ClipboardList,
  FileText,
  Loader2,
  CheckCircle2,
  Calendar,
  Eye,
  MessageSquare,
} from "lucide-react";
import { getMyArenaClasses } from "@/lib/api/classes";
import type { ArenaClass } from "@/lib/api/classes";
import {
  getLessonPlans,
  createAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
} from "@/lib/api/teacher";
import type { LessonPlan, AssignmentSubmission } from "@/lib/api/teacher";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ================================
// 메인 페이지
// ================================
export default function AssignmentManagementPage() {
  const [classes, setClasses] = useState<ArenaClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("create"); // "create", "submissions", "grade"

  // 과제 출제
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [createdAssignments, setCreatedAssignments] = useState<any[]>([]);

  // 제출 현황
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // 채점 다이얼로그 UI 상태
  const [gradeDialog, setGradeDialog] = useState<AssignmentSubmission | null>(
    null
  );
  const [gradeScore, setGradeScore] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [grading, setGrading] = useState(false);

  // 클래스 로드
  useEffect(() => {
    async function fetchClasses() {
      try {
        setLoading(true);
        const data = await getMyArenaClasses();
        setClasses(data || []);
        if (data && data.length > 0) {
          setSelectedClassId(String(data[0].id));
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  // 수업 계획 로드
  useEffect(() => {
    if (!selectedClassId) return;
    async function fetchPlans() {
      try {
        const data = await getLessonPlans(selectedClassId);
        setLessonPlans(data || []);
        if (data && data.length > 0) {
          setSelectedLessonId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      }
    }
    fetchPlans();
  }, [selectedClassId]);

  // 과제 출제
  const handleCreate = async () => {
    if (!selectedClassId || !title.trim()) return;
    try {
      setCreating(true);
      const result = await createAssignment(selectedClassId, {
        lessonId: selectedLessonId || undefined,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
      });
      setCreatedAssignments((prev) => [...prev, result]);
      setCreated(true);
      setTitle("");
      setDescription("");
      setDueDate("");
      setTimeout(() => setCreated(false), 3000);
    } catch (err) {
      console.error("Failed to create assignment:", err);
      alert("과제 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  };

  // 제출 현황 조회
  const fetchSubmissions = async (assignmentId: string) => {
    if (!selectedClassId || !assignmentId) return;
    try {
      setSubmissionsLoading(true);
      const data = await getAssignmentSubmissions(
        selectedClassId,
        assignmentId
      );
      setSubmissions(data || []);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // 채점
  const handleGrade = async () => {
    if (!gradeDialog || !selectedClassId || !selectedAssignmentId) return;
    try {
      setGrading(true);
      await gradeSubmission(
        selectedClassId,
        selectedAssignmentId,
        gradeDialog.id,
        {
          score: Number(gradeScore) || 0,
          feedback: gradeFeedback.trim() || undefined,
        }
      );
      setGradeDialog(null);
      setGradeScore("");
      setGradeFeedback("");
      fetchSubmissions(selectedAssignmentId);
    } catch (err) {
      console.error("Failed to grade:", err);
      alert("채점에 실패했습니다.");
    } finally {
      setGrading(false);
    }
  };

  // 통계
  const submittedCount = submissions.filter((s) => s.submittedAt).length;
  const gradedCount = submissions.filter(
    (s) => s.score !== undefined && s.score !== null
  ).length;

  if (loading) {
    return (
      <PageContainer className="space-y-6">
        <PageHeader
          title="과제 관리"
          description="학생들에게 과제를 출제하고 제출된 과제를 채점하세요"
        />
        <Spinner full label="과제 정보를 불러오는 중..." />
      </PageContainer>
    );
  }

  const TABS = [
    { id: "create", icon: Plus, label: "과제 출제" },
    { id: "submissions", icon: Eye, label: "제출 현황" },
    { id: "grade", icon: FileText, label: "채점" },
  ];

  const selectClassName =
    "h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="과제 관리"
        description="학생들에게 과제를 출제하고 제출된 과제를 채점하세요"
      />

      {/* 클래스 선택 */}
      <div className="rounded-xl border bg-card p-4">
        <p className="mb-3 text-sm font-semibold text-muted-foreground">
          클래스 선택
        </p>
        <div className="flex flex-wrap gap-2">
          {classes.map((cls) => (
            <Button
              key={cls.id}
              variant={
                String(cls.id) === selectedClassId ? "default" : "outline"
              }
              size="sm"
              onClick={() => setSelectedClassId(String(cls.id))}
            >
              {cls.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 탭 헤더 */}
      <div className="flex gap-6 border-b">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 py-3 text-sm transition-colors",
                isActive
                  ? "border-primary font-semibold text-primary"
                  : "border-transparent font-medium text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 과제 출제 */}
      {activeTab === "create" && (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
            <ClipboardList className="h-4 w-4 text-primary" />새 과제 출제
          </h2>
          <div className="max-w-[600px] space-y-4">
            {created && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                과제가 생성되었습니다!
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="lesson-select">연결할 수업 계획 (선택)</Label>
              <select
                id="lesson-select"
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className={selectClassName}
              >
                <option value="">없음</option>
                {lessonPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title-input">
                과제 제목 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title-input"
                type="text"
                placeholder="예: 3단원 연습문제"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description-input">설명</Label>
              <textarea
                id="description-input"
                placeholder="과제 내용을 설명하세요..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="due-date-input" className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                마감일
              </Label>
              <Input
                id="due-date-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <Button
              className="mt-2 w-full"
              onClick={handleCreate}
              disabled={creating || !title.trim()}
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              과제 출제
            </Button>
          </div>

          {createdAssignments.length > 0 && (
            <div className="mt-8 space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">
                출제된 과제
              </h4>
              {createdAssignments.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2 text-sm"
                >
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <span className="flex-1">{a.title || a.id}</span>
                  {a.dueDate && (
                    <span className="text-xs text-muted-foreground">
                      마감: {a.dueDate.split("T")[0]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 제출 현황 */}
      {activeTab === "submissions" && (
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Eye className="h-4 w-4 text-primary" />
              제출 현황
            </h2>
            <select
              value={selectedAssignmentId}
              onChange={(e) => {
                setSelectedAssignmentId(e.target.value);
                if (e.target.value) fetchSubmissions(e.target.value);
              }}
              className={cn(selectClassName, "w-60")}
            >
              <option value="">과제 선택</option>
              {createdAssignments.map((a, i) => (
                <option key={i} value={a.id}>
                  {a.title || `과제 ${i + 1}`}
                </option>
              ))}
            </select>
          </div>

          {/* 통계 */}
          {submissions.length > 0 && (
            <div className="mb-6 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {submissions.length}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  전체
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {submittedCount}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  제출
                </div>
              </div>
              <div className="rounded-lg bg-amber-50 p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {submissions.length - submittedCount}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  미제출
                </div>
              </div>
            </div>
          )}

          {submissionsLoading ? (
            <Spinner label="제출 현황을 불러오는 중..." />
          ) : submissions.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-3 text-left font-semibold">학생</th>
                  <th className="p-3 text-left font-semibold">제출 상태</th>
                  <th className="p-3 text-left font-semibold">제출일</th>
                  <th className="p-3 text-left font-semibold">점수</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} className="border-b">
                    <td className="p-3 text-sm font-semibold">
                      {sub.studentName || sub.studentId}
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                          sub.submittedAt
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {sub.submittedAt ? "제출완료" : "미제출"}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {sub.submittedAt
                        ? new Date(sub.submittedAt).toLocaleDateString(
                            "ko-KR"
                          )
                        : "—"}
                    </td>
                    <td className="p-3 text-sm font-medium">
                      {sub.score !== undefined && sub.score !== null
                        ? `${sub.score}점`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              icon={Eye}
              title={
                selectedAssignmentId
                  ? "제출 기록이 없습니다"
                  : "과제를 선택하세요"
              }
              description={
                selectedAssignmentId
                  ? "아직 제출된 과제가 없습니다"
                  : "조회할 과제를 선택하면 제출 현황이 표시됩니다"
              }
            />
          )}
        </div>
      )}

      {/* 채점 */}
      {activeTab === "grade" && (
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              채점
            </h2>
            <select
              value={selectedAssignmentId}
              onChange={(e) => {
                setSelectedAssignmentId(e.target.value);
                if (e.target.value) fetchSubmissions(e.target.value);
              }}
              className={cn(selectClassName, "w-60")}
            >
              <option value="">과제 선택</option>
              {createdAssignments.map((a, i) => (
                <option key={i} value={a.id}>
                  {a.title || `과제 ${i + 1}`}
                </option>
              ))}
            </select>
          </div>

          {submissions.length > 0 && (
            <div className="mb-6 rounded-lg bg-muted px-4 py-3 text-sm">
              전체 {submissions.length}명 중{" "}
              <span className="font-bold text-emerald-600">
                {gradedCount}명
              </span>{" "}
              채점 완료,{" "}
              <span className="font-bold text-amber-600">
                {submittedCount - gradedCount}명
              </span>{" "}
              채점 대기
            </div>
          )}

          {submissionsLoading ? (
            <Spinner label="제출 현황을 불러오는 중..." />
          ) : submissions.filter((s) => s.submittedAt).length > 0 ? (
            <div className="space-y-3">
              {submissions
                .filter((s) => s.submittedAt)
                .map((sub) => (
                  <div
                    key={sub.id}
                    className="rounded-lg border p-4 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-base font-semibold text-foreground">
                          {sub.studentName || sub.studentId}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          제출:{" "}
                          {new Date(sub.submittedAt!).toLocaleString("ko-KR")}
                        </div>
                      </div>
                      <div>
                        {sub.score !== undefined && sub.score !== null ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-sm font-medium text-emerald-700">
                            {sub.score}점
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              setGradeDialog(sub);
                              setGradeScore("");
                              setGradeFeedback("");
                            }}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            채점
                          </Button>
                        )}
                      </div>
                    </div>
                    {sub.feedback && (
                      <div className="mt-3 rounded-md bg-muted px-3 py-2 text-sm text-foreground">
                        💬 {sub.feedback}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title={
                selectedAssignmentId
                  ? "제출된 과제가 없습니다"
                  : "과제를 선택하세요"
              }
              description={
                selectedAssignmentId
                  ? "채점할 제출 과제가 아직 없습니다"
                  : "채점할 과제를 선택하면 제출 목록이 표시됩니다"
              }
            />
          )}
        </div>
      )}

      {/* 채점 다이얼로그 */}
      <Dialog
        open={gradeDialog !== null}
        onOpenChange={(open) => {
          if (!open) setGradeDialog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {gradeDialog?.studentName || gradeDialog?.studentId} 채점
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="grade-score">점수</Label>
              <Input
                id="grade-score"
                type="number"
                placeholder="점수 입력"
                value={gradeScore}
                onChange={(e) => setGradeScore(e.target.value)}
                min={0}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="grade-feedback">피드백</Label>
              <textarea
                id="grade-feedback"
                placeholder="학생에게 전달할 피드백을 작성하세요..."
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                rows={3}
                className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button variant="secondary" onClick={() => setGradeDialog(null)}>
              취소
            </Button>
            <Button
              onClick={handleGrade}
              disabled={grading || !gradeScore}
            >
              {grading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              채점 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
