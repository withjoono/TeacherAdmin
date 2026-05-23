"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Calendar,
  Loader2,
  X,
} from "lucide-react";
import { getMyArenaClasses } from "@/lib/api/classes";
import type { ArenaClass } from "@/lib/api/classes";
import {
  getLessonPlans,
  createLessonPlan,
  updateLessonPlan,
  deleteLessonPlan,
} from "@/lib/api/teacher";
import type { LessonPlan } from "@/lib/api/teacher";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// ================================
// 메인 페이지
// ================================
export default function CurriculumManagementPage() {
  const [classes, setClasses] = useState<ArenaClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(false);

  // 생성 폼
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("");
  const [creating, setCreating] = useState(false);

  // 수정 다이얼로그
  const [editPlan, setEditPlan] = useState<LessonPlan | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editProgress, setEditProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  // 삭제 확인
  const [deletePlan, setDeletePlan] = useState<LessonPlan | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 클래스 목록 로드
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
        setClasses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  // 선택된 클래스의 수업 계획 목록 로드
  const fetchPlans = useCallback(async () => {
    if (!selectedClassId) return;
    try {
      setPlansLoading(true);
      const data = await getLessonPlans(selectedClassId);
      setLessonPlans(data || []);
    } catch (err) {
      console.error("Failed to fetch lesson plans:", err);
      setLessonPlans([]);
    } finally {
      setPlansLoading(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // 생성
  const handleCreate = async () => {
    if (!newTitle.trim() || !selectedClassId) return;
    try {
      setCreating(true);
      await createLessonPlan(selectedClassId, {
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        scheduledDate: newDate || undefined,
      });
      setNewTitle("");
      setNewDesc("");
      setNewDate("");
      setShowCreateForm(false);
      fetchPlans();
    } catch (err) {
      console.error("Failed to create lesson plan:", err);
      alert("수업 계획 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  };

  // 수정 다이얼로그 열기
  const openEdit = (plan: LessonPlan) => {
    setEditPlan(plan);
    setEditTitle(plan.title);
    setEditDesc(plan.description || "");
    setEditDate(plan.scheduledDate?.split("T")[0] || "");
    setEditProgress(plan.progress || 0);
  };

  // 수정 저장
  const handleUpdate = async () => {
    if (!editPlan || !selectedClassId) return;
    try {
      setSaving(true);
      await updateLessonPlan(selectedClassId, editPlan.id, {
        title: editTitle.trim() || undefined,
        description: editDesc.trim() || undefined,
        scheduledDate: editDate || undefined,
        progress: editProgress,
      });
      setEditPlan(null);
      fetchPlans();
    } catch (err) {
      console.error("Failed to update lesson plan:", err);
      alert("수업 계획 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!deletePlan || !selectedClassId) return;
    try {
      setDeleting(true);
      await deleteLessonPlan(selectedClassId, deletePlan.id);
      setDeletePlan(null);
      fetchPlans();
    } catch (err) {
      console.error("Failed to delete lesson plan:", err);
      alert("수업 계획 삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="space-y-6">
        <PageHeader title="수업 계획" description="클래스별 수업 진도와 예정을 관리하세요" />
        <Spinner full label="불러오는 중..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="수업 계획" description="클래스별 수업 진도와 예정을 관리하세요" />

      {/* 반 선택 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">클래스 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {classes.map((cls) => (
              <Button
                key={cls.id}
                variant={String(cls.id) === selectedClassId ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedClassId(String(cls.id))}
              >
                {cls.name}
              </Button>
            ))}
            {classes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                클래스가 없습니다. 클래스 관리에서 먼저 생성하세요.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 수업 계획 목록 */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-[18px] w-[18px] text-primary" />
            수업 계획
          </CardTitle>
          <Button size="sm" onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4" />
            새 계획 추가
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 생성 폼 (인라인) */}
          {showCreateForm && (
            <div className="space-y-3 rounded-lg border-2 border-dashed bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-foreground">새 수업 계획</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowCreateForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Input
                placeholder="제목 *"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <textarea
                className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="설명 (선택사항)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
              />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="w-auto"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setShowCreateForm(false)}>
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={creating || !newTitle.trim()}
                  >
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "생성"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 계획 리스트 */}
          {plansLoading ? (
            <Spinner label="불러오는 중..." />
          ) : lessonPlans.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {lessonPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-foreground">{plan.title}</h4>
                      {plan.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {plan.description}
                        </p>
                      )}
                      {plan.scheduledDate && (
                        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {plan.scheduledDate.split("T")[0]}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => openEdit(plan)}
                        title="수정"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeletePlan(plan)}
                        title="삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 진도바 */}
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">진도율</span>
                      <span className="font-semibold text-foreground">
                        {plan.progress || 0}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${plan.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="등록된 수업 계획이 없습니다"
              description='"새 계획 추가" 버튼으로 시작하세요.'
            />
          )}
        </CardContent>
      </Card>

      {/* 수정 다이얼로그 */}
      <Dialog open={!!editPlan} onOpenChange={(o) => !o && setEditPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>수업 계획 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">제목</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">설명</Label>
              <textarea
                id="edit-desc"
                className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">예정일</Label>
              <Input
                id="edit-date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>진도율: {editProgress}%</Label>
              <input
                type="range"
                min={0}
                max={100}
                value={editProgress}
                onChange={(e) => setEditProgress(Number(e.target.value))}
                className="block w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">취소</Button>
            </DialogClose>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={!!deletePlan} onOpenChange={(o) => !o && setDeletePlan(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>수업 계획 삭제</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-sm text-muted-foreground">
            &quot;{deletePlan?.title}&quot;을(를) 정말 삭제하시겠습니까?
            <br />
            <span className="text-destructive">이 작업은 되돌릴 수 없습니다.</span>
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">취소</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
