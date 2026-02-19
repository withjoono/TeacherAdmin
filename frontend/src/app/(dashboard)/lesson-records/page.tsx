"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
            <div className="flex flex-col">
                <Header title="수업 기록" />
                <div className="flex-1 flex items-center justify-center p-6">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <Header title="수업 기록" />

            <div className="flex-1 p-6 space-y-6">
                {/* 클래스 선택 */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex gap-2 flex-wrap items-center">
                            <span className="text-sm font-medium text-muted-foreground mr-2">
                                클래스
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
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* 좌측: 수업 계획 목록 */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-base">수업 계획 선택</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {plansLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : lessonPlans.length > 0 ? (
                                <div className="space-y-2">
                                    {lessonPlans.map((plan) => (
                                        <button
                                            key={plan.id}
                                            onClick={() => setSelectedPlanId(plan.id)}
                                            className={`w-full text-left p-3 rounded-lg transition-all ${plan.id === selectedPlanId
                                                    ? "bg-primary/10 border-2 border-primary/30"
                                                    : "border hover:bg-accent/50"
                                                }`}
                                        >
                                            <p className="text-sm font-medium">{plan.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${plan.progress || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {plan.progress || 0}%
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    수업 계획이 없습니다
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* 우측: 기록 입력 폼 */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                수업 기록 작성
                                {selectedPlan && (
                                    <span className="text-sm font-normal text-muted-foreground ml-2">
                                        — {selectedPlan.title}
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {saved && (
                                <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="w-4 h-4" />
                                    수업 기록이 저장되었습니다. 진도율이 자동 업데이트됩니다.
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* 날짜 */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        <Calendar className="w-3.5 h-3.5 inline mr-1" />
                                        수업 날짜
                                    </label>
                                    <Input
                                        type="date"
                                        value={recordDate}
                                        onChange={(e) => setRecordDate(e.target.value)}
                                        className="w-auto"
                                    />
                                </div>

                                {/* 요약 */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">수업 요약</label>
                                    <textarea
                                        placeholder="오늘 수업 내용을 요약하세요..."
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>

                                {/* 범위 (페이지) */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">범위 (페이지)</label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            placeholder="시작 페이지"
                                            value={pagesFrom}
                                            onChange={(e) => setPagesFrom(e.target.value)}
                                            className="w-32"
                                        />
                                        <span className="text-muted-foreground">~</span>
                                        <Input
                                            type="number"
                                            placeholder="끝 페이지"
                                            value={pagesTo}
                                            onChange={(e) => setPagesTo(e.target.value)}
                                            className="w-32"
                                        />
                                    </div>
                                </div>

                                {/* 핵심 개념 */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">핵심 개념</label>
                                    <textarea
                                        placeholder="오늘 다룬 핵심 개념을 적어주세요..."
                                        value={conceptNote}
                                        onChange={(e) => setConceptNote(e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>

                                {/* 저장 버튼 */}
                                <div className="flex justify-end pt-2">
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving || !selectedPlanId}
                                        className="min-w-[120px]"
                                    >
                                        {saving ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <Plus className="w-4 h-4 mr-2" />
                                        )}
                                        기록 저장
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
