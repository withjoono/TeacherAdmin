"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Calendar,
    FileText,
    Loader2,
    Plus,
    CheckCircle2,
    BookOpen,
} from "lucide-react";
import { getMyArenaClasses } from "@/lib/api/classes";
import type { ArenaClass } from "@/lib/api/classes";
import {
    getLessonPlans,
    createLessonRecord,
    updateLessonPlan,
} from "@/lib/api/teacher";
import type { LessonPlan } from "@/lib/api/teacher";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
            <PageContainer className="space-y-6">
                <Spinner full label="불러오는 중..." />
            </PageContainer>
        );
    }

    return (
        <PageContainer className="space-y-6">
            <PageHeader
                title="수업 기록"
                description="매 수업마다 다룬 내용과 진도를 기록하세요"
            />

            {/* 클래스 선택 */}
            <Card>
                <CardContent className="p-6">
                    <p className="mb-3 text-sm font-semibold text-muted-foreground">
                        클래스 선택
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {classes.map((cls) => (
                            <Button
                                key={cls.id}
                                variant={
                                    String(cls.id) === selectedClassId
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => setSelectedClassId(String(cls.id))}
                            >
                                {cls.name}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid items-start gap-6 lg:grid-cols-3">
                {/* 좌측: 수업 계획 목록 */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">수업 계획 선택</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {plansLoading ? (
                            <Spinner />
                        ) : lessonPlans.length > 0 ? (
                            <div className="space-y-2">
                                {lessonPlans.map((plan) => {
                                    const isSelected = plan.id === selectedPlanId;
                                    return (
                                        <button
                                            key={plan.id}
                                            onClick={() => setSelectedPlanId(plan.id)}
                                            className={cn(
                                                "w-full rounded-lg border p-3 text-left transition-colors",
                                                isSelected
                                                    ? "border-primary bg-accent"
                                                    : "hover:bg-muted"
                                            )}
                                        >
                                            <div className="text-sm font-medium text-foreground">
                                                {plan.title}
                                            </div>
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-primary transition-all"
                                                        style={{
                                                            width: `${plan.progress || 0}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {plan.progress || 0}%
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                icon={BookOpen}
                                title="수업 계획이 없습니다"
                            />
                        )}
                    </CardContent>
                </Card>

                {/* 우측: 기록 입력 폼 */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-[18px] w-[18px] text-primary" />
                            수업 기록 작성
                            {selectedPlan && (
                                <span className="ml-1 text-sm font-normal text-muted-foreground">
                                    — {selectedPlan.title}
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {saved && (
                            <div className="flex items-center gap-2 rounded-lg bg-accent p-3 text-sm font-medium text-primary">
                                <CheckCircle2 className="h-4 w-4" />
                                수업 기록이 저장되었습니다. 진도율이 자동 업데이트됩니다.
                            </div>
                        )}

                        {/* 날짜 */}
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                수업 날짜
                            </Label>
                            <Input
                                type="date"
                                value={recordDate}
                                onChange={(e) => setRecordDate(e.target.value)}
                                className="w-auto"
                            />
                        </div>

                        {/* 요약 */}
                        <div className="space-y-1.5">
                            <Label>수업 요약</Label>
                            <textarea
                                placeholder="오늘 수업 내용을 요약하세요..."
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                rows={3}
                                className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>

                        {/* 범위 (페이지) */}
                        <div className="space-y-1.5">
                            <Label>범위 (페이지)</Label>
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
                        <div className="space-y-1.5">
                            <Label>핵심 개념</Label>
                            <textarea
                                placeholder="오늘 다룬 핵심 개념을 적어주세요..."
                                value={conceptNote}
                                onChange={(e) => setConceptNote(e.target.value)}
                                rows={2}
                                className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>

                        {/* 저장 버튼 */}
                        <div className="flex justify-end pt-1">
                            <Button
                                onClick={handleSave}
                                disabled={saving || !selectedPlanId}
                                className="min-w-[120px]"
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                기록 저장
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
}
