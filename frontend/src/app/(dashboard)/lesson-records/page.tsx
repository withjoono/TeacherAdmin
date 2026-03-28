"use client";

import { useState, useEffect, useCallback } from "react";
import {
    BookOpen,
    Calendar,
    FileText,
    Loader2,
    Plus,
    CheckCircle2,
} from "lucide-react";
import { getMyArenaClasses } from "@/lib/api/classes";
import type { ArenaClass } from "@/lib/api/classes";
import {
    getLessonPlans,
    createLessonRecord,
    updateLessonPlan,
} from "@/lib/api/teacher";
import type { LessonPlan } from "@/lib/api/teacher";

export default function LessonRecordsPage() {
    const [classes, setClasses] = useState<ArenaClass[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [plansLoading, setPlansLoading] = useState(false);

    // 기록 폼
    const [recordDate, setRecordDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [summary, setSummary] = useState("");
    const [pagesFrom, setPagesFrom] = useState("");
    const [pagesTo, setPagesTo] = useState("");
    const [conceptNote, setConceptNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

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
    const fetchPlans = useCallback(async () => {
        if (!selectedClassId) return;
        try {
            setPlansLoading(true);
            const data = await getLessonPlans(selectedClassId);
            setLessonPlans(data || []);
            if (data && data.length > 0 && !selectedPlanId) {
                setSelectedPlanId(data[0].id);
            }
        } catch (err) {
            console.error("Failed to fetch plans:", err);
            setLessonPlans([]);
        } finally {
            setPlansLoading(false);
        }
    }, [selectedClassId]);

    useEffect(() => {
        setSelectedPlanId("");
        fetchPlans();
    }, [fetchPlans]);

    // 기록 저장
    const handleSave = async () => {
        if (!selectedClassId || !selectedPlanId) return;
        try {
            setSaving(true);
            await createLessonRecord(selectedClassId, {
                lessonPlanId: selectedPlanId,
                recordDate,
                summary: summary.trim() || undefined,
                pagesFrom: pagesFrom ? Number(pagesFrom) : undefined,
                pagesTo: pagesTo ? Number(pagesTo) : undefined,
                conceptNote: conceptNote.trim() || undefined,
            });

            // 진도율 자동 업데이트 (기록 시 +10%, 최대 100%)
            const plan = lessonPlans.find((p) => p.id === selectedPlanId);
            if (plan) {
                const newProgress = Math.min((plan.progress || 0) + 10, 100);
                await updateLessonPlan(selectedClassId, selectedPlanId, {
                    progress: newProgress,
                });
            }

            setSaved(true);
            setSummary("");
            setPagesFrom("");
            setPagesTo("");
            setConceptNote("");

            // 리프레시
            fetchPlans();

            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Failed to save lesson record:", err);
            alert("수업 기록 저장에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const selectedPlan = lessonPlans.find((p) => p.id === selectedPlanId);

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
                <h1 className="gb-page-title">수업 기록</h1>
                <p className="gb-page-desc">매 수업마다 다룬 내용과 진도를 기록하세요</p>
            </div>

            <div className="gb-stack gb-stack-6">
                {/* 클래스 선택 */}
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
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--space-6)", alignItems: "start" }}>
                    {/* 좌측: 수업 계획 목록 */}
                    <div className="gb-card" style={{ padding: "var(--space-6)" }}>
                        <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: "var(--text-base)" }}>
                            수업 계획 선택
                        </h2>
                        
                        {plansLoading ? (
                            <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-4) 0" }}>
                                <Loader2 style={{ width: 20, height: 20, color: "var(--color-text-disabled)", animation: "spin 1s linear infinite" }} />
                            </div>
                        ) : lessonPlans.length > 0 ? (
                            <div className="gb-stack gb-stack-2">
                                {lessonPlans.map((plan) => (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlanId(plan.id)}
                                        style={{
                                            width: "100%", textAlign: "left", padding: "var(--space-3)", borderRadius: "var(--radius-md)", border: "1px solid", transition: "all var(--transition-short)", cursor: "pointer",
                                            background: plan.id === selectedPlanId ? "var(--color-primary-50, var(--color-bg-secondary))" : "transparent",
                                            borderColor: plan.id === selectedPlanId ? "color-mix(in srgb, var(--color-primary) 30%, transparent)" : "var(--color-border-light)",
                                        }}
                                        onMouseEnter={(e) => { if (plan.id !== selectedPlanId) e.currentTarget.style.background = "var(--color-bg-secondary)" }}
                                        onMouseLeave={(e) => { if (plan.id !== selectedPlanId) e.currentTarget.style.background = "transparent" }}
                                    >
                                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text)" }}>{plan.title}</div>
                                        <div className="gb-row gb-row-2" style={{ marginTop: "var(--space-2)" }}>
                                            <div style={{ flex: 1, height: "6px", background: "var(--color-border-light)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                                                <div
                                                    style={{ height: "100%", background: "linear-gradient(to right, #60a5fa, #2563eb)", borderRadius: "var(--radius-full)", transition: "width var(--transition-normal)", width: `${plan.progress || 0}%` }}
                                                />
                                            </div>
                                            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
                                                {plan.progress || 0}%
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="gb-empty-state" style={{ padding: "var(--space-4) 0" }}>
                                수업 계획이 없습니다
                            </div>
                        )}
                    </div>

                    {/* 우측: 기록 입력 폼 */}
                    <div className="gb-card" style={{ padding: "var(--space-6)" }}>
                        <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
                            수업 기록 작성
                            {selectedPlan && (
                                <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-normal)", color: "var(--color-text-tertiary)", marginLeft: "var(--space-2)" }}>
                                    — {selectedPlan.title}
                                </span>
                            )}
                        </h2>
                        
                        {saved && (
                            <div style={{ marginBottom: "var(--space-4)", padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--color-success-10)", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-success)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>
                                <CheckCircle2 style={{ width: 16, height: 16 }} />
                                수업 기록이 저장되었습니다. 진도율이 자동 업데이트됩니다.
                            </div>
                        )}

                        <div className="gb-stack gb-stack-4">
                            {/* 날짜 */}
                            <div>
                                <label className="gb-input-label" style={{ display: "flex", alignItems: "center" }}>
                                    <Calendar style={{ width: 14, height: 14, marginRight: "4px" }} />
                                    수업 날짜
                                </label>
                                <input
                                    type="date"
                                    className="gb-input"
                                    value={recordDate}
                                    onChange={(e) => setRecordDate(e.target.value)}
                                    style={{ width: "auto" }}
                                />
                            </div>

                            {/* 요약 */}
                            <div>
                                <label className="gb-input-label">수업 요약</label>
                                <textarea
                                    className="gb-input"
                                    placeholder="오늘 수업 내용을 요약하세요..."
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    rows={3}
                                    style={{ resize: "none" }}
                                />
                            </div>

                            {/* 범위 (페이지) */}
                            <div>
                                <label className="gb-input-label">범위 (페이지)</label>
                                <div className="gb-row gb-row-2">
                                    <input
                                        type="number"
                                        className="gb-input"
                                        placeholder="시작 페이지"
                                        value={pagesFrom}
                                        onChange={(e) => setPagesFrom(e.target.value)}
                                        style={{ width: "120px" }}
                                    />
                                    <span style={{ color: "var(--color-text-tertiary)" }}>~</span>
                                    <input
                                        type="number"
                                        className="gb-input"
                                        placeholder="끝 페이지"
                                        value={pagesTo}
                                        onChange={(e) => setPagesTo(e.target.value)}
                                        style={{ width: "120px" }}
                                    />
                                </div>
                            </div>

                            {/* 핵심 개념 */}
                            <div>
                                <label className="gb-input-label">핵심 개념</label>
                                <textarea
                                    className="gb-input"
                                    placeholder="오늘 다룬 핵심 개념을 적어주세요..."
                                    value={conceptNote}
                                    onChange={(e) => setConceptNote(e.target.value)}
                                    rows={2}
                                    style={{ resize: "none" }}
                                />
                            </div>

                            {/* 저장 버튼 */}
                            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "var(--space-2)" }}>
                                <button
                                    className="gb-btn gb-btn-primary"
                                    onClick={handleSave}
                                    disabled={saving || !selectedPlanId}
                                    style={{ minWidth: "120px", justifyContent: "center" }}
                                >
                                    {saving ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Plus style={{ width: 16, height: 16 }} />}
                                    기록 저장
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
