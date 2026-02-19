"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
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
      <div className="flex flex-col">
        <Header title="수업 계획" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header title="수업 계획" />

      <div className="flex-1 p-6 space-y-6">
        {/* 반 선택 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm font-medium text-muted-foreground mr-2">
                클래스 선택
              </span>
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(String(cls.id))}
                  className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${String(cls.id) === selectedClassId
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted hover:bg-muted/80"
                    }`}
                >
                  {cls.name}
                </button>
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                수업 계획
              </CardTitle>
              <Button size="sm" onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                새 계획 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 생성 폼 (인라인) */}
            {showCreateForm && (
              <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">새 수업 계획</h4>
                  <button onClick={() => setShowCreateForm(false)}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <Input
                  placeholder="제목 *"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <textarea
                  placeholder="설명 (선택사항)"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                  <div className="flex-1" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={creating || !newTitle.trim()}
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "생성"}
                  </Button>
                </div>
              </div>
            )}

            {/* 계획 리스트 */}
            {plansLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : lessonPlans.length > 0 ? (
              <div className="space-y-3">
                {lessonPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 rounded-lg border hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{plan.title}</h4>
                        {plan.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {plan.description}
                          </p>
                        )}
                        {plan.scheduledDate && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {plan.scheduledDate.split("T")[0]}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(plan)}
                          className="p-1.5 rounded-md hover:bg-accent transition-colors"
                          title="수정"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => setDeletePlan(plan)}
                          className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* 진도바 */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">진도율</span>
                        <span className="font-semibold">{plan.progress || 0}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                          style={{ width: `${plan.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                등록된 수업 계획이 없습니다. "새 계획 추가" 버튼으로 시작하세요.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 수정 다이얼로그 */}
      <Dialog open={!!editPlan} onOpenChange={(o) => !o && setEditPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>수업 계획 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">제목</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">설명</label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">예정일</label>
              <Input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                진도율: {editProgress}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={editProgress}
                onChange={(e) => setEditProgress(Number(e.target.value))}
                className="w-full accent-primary"
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
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={!!deletePlan} onOpenChange={(o) => !o && setDeletePlan(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>수업 계획 삭제</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            &ldquo;{deletePlan?.title}&rdquo;을(를) 정말 삭제하시겠습니까?
            <br />이 작업은 되돌릴 수 없습니다.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
