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
      <div className="gb-page-dashboard gb-stack gb-stack-6" style={{ paddingTop: "var(--space-10)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
          <Loader2 style={{ width: 32, height: 32, color: "var(--color-text-disabled)", animation: "spin 1s linear infinite" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="gb-page-dashboard gb-stack gb-stack-8" style={{ paddingTop: "var(--space-10)" }}>
      {/* 페이지 헤더 */}
      <div className="gb-page-header" style={{ marginBottom: 0 }}>
        <h1 className="gb-page-title">수업 계획</h1>
        <p className="gb-page-desc">클래스별 수업 진도와 예정을 관리하세요</p>
      </div>

      <div className="gb-stack gb-stack-6">
        {/* 반 선택 */}
        <div className="gb-card">
          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-3)" }}>
            클래스 선택
          </div>
          <div className="gb-row gb-row-3" style={{ flexWrap: "wrap" }}>
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(String(cls.id))}
                className={`gb-btn ${String(cls.id) === selectedClassId ? 'gb-btn-primary' : 'gb-btn-outline'}`}
              >
                {cls.name}
              </button>
            ))}
            {classes.length === 0 && (
              <p className="gb-page-desc">클래스가 없습니다. 클래스 관리에서 먼저 생성하세요.</p>
            )}
          </div>
        </div>

        {/* 수업 계획 목록 */}
        <div className="gb-card">
          <div className="gb-row gb-row-4" style={{ justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
            <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
              <BookOpen style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
              수업 계획
            </h2>
            <button
              className="gb-btn gb-btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus style={{ width: 16, height: 16 }} />
              새 계획 추가
            </button>
          </div>

          {/* 생성 폼 (인라인) */}
          {showCreateForm && (
            <div className="gb-stack gb-stack-3" style={{ marginBottom: "var(--space-8)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", border: "2px dashed var(--color-border)", background: "var(--color-primary-50, var(--color-bg-secondary))" }}>
              <div className="gb-row" style={{ justifyContent: "space-between" }}>
                <h4 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "var(--color-text)" }}>새 수업 계획</h4>
                <button
                  className="gb-header-icon-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
              
              <input
                className="gb-input"
                placeholder="제목 *"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <textarea
                className="gb-input"
                placeholder="설명 (선택사항)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                style={{ resize: "none" }}
              />
              
              <div className="gb-row gb-row-4" style={{ justifyContent: "space-between" }}>
                <div className="gb-row gb-row-2">
                  <Calendar style={{ width: 16, height: 16, color: "var(--color-text-tertiary)" }} />
                  <input
                    type="date"
                    className="gb-input"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    style={{ width: "auto" }}
                  />
                </div>
                <div className="gb-row gb-row-2">
                  <button
                    className="gb-btn gb-btn-secondary"
                    onClick={() => setShowCreateForm(false)}
                  >
                    취소
                  </button>
                  <button
                    className="gb-btn gb-btn-primary"
                    onClick={handleCreate}
                    disabled={creating || !newTitle.trim()}
                  >
                    {creating ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : "생성"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 계획 리스트 */}
          {plansLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-8) 0" }}>
              <Loader2 style={{ width: 24, height: 24, color: "var(--color-text-disabled)", animation: "spin 1s linear infinite" }} />
            </div>
          ) : lessonPlans.length > 0 ? (
            <div className="gb-grid gb-grid-4">
              {lessonPlans.map((plan) => (
                <div
                  key={plan.id}
                  style={{
                    padding: "var(--space-4)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-border-light)",
                    transition: "all var(--transition-short)",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-bg-secondary)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "var(--color-text)" }}>{plan.title}</h4>
                      {plan.description && (
                        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginTop: "var(--space-2)" }}>
                          {plan.description}
                        </p>
                      )}
                      {plan.scheduledDate && (
                        <p style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-2)" }}>
                          <Calendar style={{ width: 12, height: 12 }} />
                          {plan.scheduledDate.split("T")[0]}
                        </p>
                      )}
                    </div>
                    <div className="gb-row gb-row-1">
                      <button
                        onClick={() => openEdit(plan)}
                        style={{ padding: "var(--space-1)", borderRadius: "var(--radius-sm)", color: "var(--color-text-secondary)", background: "transparent", border: "none", cursor: "pointer" }}
                        title="수정"
                      >
                        <Pencil style={{ width: 16, height: 16 }} />
                      </button>
                      <button
                        onClick={() => setDeletePlan(plan)}
                        style={{ padding: "var(--space-1)", borderRadius: "var(--radius-sm)", color: "var(--color-error)", background: "transparent", border: "none", cursor: "pointer" }}
                        title="삭제"
                      >
                        <Trash2 style={{ width: 16, height: 16 }} />
                      </button>
                    </div>
                  </div>

                  {/* 진도바 */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--text-xs)", marginBottom: "var(--space-1)" }}>
                      <span style={{ color: "var(--color-text-tertiary)" }}>진도율</span>
                      <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-text)" }}>{plan.progress || 0}%</span>
                    </div>
                    <div style={{ height: "8px", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                      <div
                        style={{ height: "100%", background: "linear-gradient(to right, #60a5fa, #2563eb)", borderRadius: "var(--radius-full)", transition: "width var(--transition-normal)", width: `${plan.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gb-empty-state" style={{ padding: "var(--space-8) 0" }}>
              등록된 수업 계획이 없습니다. &quot;새 계획 추가&quot; 버튼으로 시작하세요.
            </div>
          )}
        </div>
      </div>

      {/* 수정 다이얼로그 */}
      {editPlan && (
        <div className="gb-modal-overlay">
          <div className="gb-modal">
            <div className="gb-row" style={{ justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
              <h2 className="gb-modal-title" style={{ marginBottom: 0 }}>수업 계획 수정</h2>
              <button className="gb-header-icon-btn" onClick={() => setEditPlan(null)}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            
            <div className="gb-stack gb-stack-4">
              <div>
                <label className="gb-input-label">제목</label>
                <input
                  className="gb-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="gb-input-label">설명</label>
                <textarea
                  className="gb-input"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  style={{ resize: "none" }}
                />
              </div>
              <div>
                <label className="gb-input-label">예정일</label>
                <input
                  type="date"
                  className="gb-input"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>
              <div>
                <label className="gb-input-label">
                  진도율: {editProgress}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editProgress}
                  onChange={(e) => setEditProgress(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--color-primary)", display: "block", marginBottom: "var(--space-2)" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            
            <div className="gb-modal-actions" style={{ marginTop: "var(--space-6)" }}>
              <button className="gb-btn gb-btn-secondary" onClick={() => setEditPlan(null)}>취소</button>
              <button
                className="gb-btn gb-btn-primary"
                onClick={handleUpdate}
                disabled={saving}
              >
                {saving ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : null}
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      {deletePlan && (
        <div className="gb-modal-overlay">
          <div className="gb-modal" style={{ maxWidth: '400px' }}>
            <div className="gb-row" style={{ justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
              <h2 className="gb-modal-title" style={{ marginBottom: 0 }}>수업 계획 삭제</h2>
              <button className="gb-header-icon-btn" onClick={() => setDeletePlan(null)}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-6)" }}>
              &quot;{deletePlan?.title}&quot;을(를) 정말 삭제하시겠습니까?<br />
              <span style={{ color: "var(--color-error)" }}>이 작업은 되돌릴 수 없습니다.</span>
            </p>
            
            <div className="gb-modal-actions">
              <button className="gb-btn gb-btn-secondary" onClick={() => setDeletePlan(null)}>취소</button>
              <button
                className="gb-btn"
                style={{ background: "var(--color-error)", color: "white", border: "none" }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : null}
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
