"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    ClipboardList,
    FileText,
    Users,
    Loader2,
    CheckCircle2,
    Save,
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

// ================================
// 메인 페이지
// ================================
export default function AssignmentManagementPage() {
    const [classes, setClasses] = useState<ArenaClass[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [loading, setLoading] = useState(true);

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

    // 채점
    const [gradeDialog, setGradeDialog] = useState<AssignmentSubmission | null>(null);
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
            const data = await getAssignmentSubmissions(selectedClassId, assignmentId);
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
            await gradeSubmission(selectedClassId, selectedAssignmentId, gradeDialog.id, {
                score: Number(gradeScore) || 0,
                feedback: gradeFeedback.trim() || undefined,
            });
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
    const gradedCount = submissions.filter((s) => s.score !== undefined && s.score !== null).length;

    if (loading) {
        return (
            <div className="flex flex-col">
                <Header title="과제 관리" />
                <div className="flex-1 flex items-center justify-center p-6">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <Header title="과제 관리" />

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

                <Tabs defaultValue="create" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="create">
                            <Plus className="w-4 h-4 mr-2" />
                            과제 출제
                        </TabsTrigger>
                        <TabsTrigger value="submissions">
                            <Eye className="w-4 h-4 mr-2" />
                            제출 현황
                        </TabsTrigger>
                        <TabsTrigger value="grade">
                            <FileText className="w-4 h-4 mr-2" />
                            채점
                        </TabsTrigger>
                    </TabsList>

                    {/* 과제 출제 */}
                    <TabsContent value="create" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5" />
                                    새 과제 출제
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {created && (
                                    <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4" />
                                        과제가 생성되었습니다!
                                    </div>
                                )}
                                <div className="space-y-4 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            연결할 수업 계획 (선택)
                                        </label>
                                        <select
                                            value={selectedLessonId}
                                            onChange={(e) => setSelectedLessonId(e.target.value)}
                                            className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value="">없음</option>
                                            {lessonPlans.map((plan) => (
                                                <option key={plan.id} value={plan.id}>
                                                    {plan.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">과제 제목 *</label>
                                        <Input
                                            placeholder="예: 3단원 연습문제"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">설명</label>
                                        <textarea
                                            placeholder="과제 내용을 설명하세요..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            <Calendar className="w-3.5 h-3.5 inline mr-1" />
                                            마감일
                                        </label>
                                        <Input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-auto"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleCreate}
                                        disabled={creating || !title.trim()}
                                        className="w-full"
                                    >
                                        {creating ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <Plus className="w-4 h-4 mr-2" />
                                        )}
                                        과제 출제
                                    </Button>
                                </div>

                                {createdAssignments.length > 0 && (
                                    <div className="mt-6 space-y-2">
                                        <h4 className="text-sm font-medium text-muted-foreground">
                                            출제된 과제
                                        </h4>
                                        {createdAssignments.map((a, i) => (
                                            <div
                                                key={i}
                                                className="p-3 rounded-lg border bg-accent/30 text-sm flex items-center gap-2"
                                            >
                                                <ClipboardList className="w-4 h-4 text-primary" />
                                                {a.title || a.id}
                                                {a.dueDate && (
                                                    <span className="text-xs text-muted-foreground ml-auto">
                                                        마감: {a.dueDate.split("T")[0]}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 제출 현황 */}
                    <TabsContent value="submissions" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Eye className="w-5 h-5" />
                                        제출 현황
                                    </CardTitle>
                                    <select
                                        value={selectedAssignmentId}
                                        onChange={(e) => {
                                            setSelectedAssignmentId(e.target.value);
                                            if (e.target.value) fetchSubmissions(e.target.value);
                                        }}
                                        className="px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="">과제 선택</option>
                                        {createdAssignments.map((a, i) => (
                                            <option key={i} value={a.id}>
                                                {a.title || `과제 ${i + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* 통계 */}
                                {submissions.length > 0 && (
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="p-4 rounded-lg bg-blue-50 text-center">
                                            <p className="text-2xl font-bold text-blue-600">
                                                {submissions.length}
                                            </p>
                                            <p className="text-xs text-muted-foreground">전체</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-green-50 text-center">
                                            <p className="text-2xl font-bold text-green-600">
                                                {submittedCount}
                                            </p>
                                            <p className="text-xs text-muted-foreground">제출</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-orange-50 text-center">
                                            <p className="text-2xl font-bold text-orange-600">
                                                {submissions.length - submittedCount}
                                            </p>
                                            <p className="text-xs text-muted-foreground">미제출</p>
                                        </div>
                                    </div>
                                )}

                                {submissionsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : submissions.length > 0 ? (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-4 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                                            <div>학생</div>
                                            <div>제출 상태</div>
                                            <div>제출일</div>
                                            <div>점수</div>
                                        </div>
                                        {submissions.map((sub) => (
                                            <div
                                                key={sub.id}
                                                className="grid grid-cols-4 gap-4 items-center px-4 py-3 rounded-lg hover:bg-accent/30"
                                            >
                                                <div className="font-medium">
                                                    {sub.studentName || sub.studentId}
                                                </div>
                                                <div>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sub.submittedAt
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-gray-100 text-gray-500"
                                                            }`}
                                                    >
                                                        {sub.submittedAt ? "제출완료" : "미제출"}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {sub.submittedAt
                                                        ? new Date(sub.submittedAt).toLocaleDateString(
                                                            "ko-KR"
                                                        )
                                                        : "-"}
                                                </div>
                                                <div className="text-sm">
                                                    {sub.score !== undefined && sub.score !== null
                                                        ? `${sub.score}점`
                                                        : "-"}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground py-8">
                                        {selectedAssignmentId
                                            ? "제출 기록이 없습니다"
                                            : "과제를 선택하세요"}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 채점 */}
                    <TabsContent value="grade" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        채점
                                    </CardTitle>
                                    <select
                                        value={selectedAssignmentId}
                                        onChange={(e) => {
                                            setSelectedAssignmentId(e.target.value);
                                            if (e.target.value) fetchSubmissions(e.target.value);
                                        }}
                                        className="px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="">과제 선택</option>
                                        {createdAssignments.map((a, i) => (
                                            <option key={i} value={a.id}>
                                                {a.title || `과제 ${i + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* 채점 현황 */}
                                {submissions.length > 0 && (
                                    <div className="mb-4 p-3 rounded-lg bg-blue-50 text-sm">
                                        전체 {submissions.length}명 중{" "}
                                        <span className="font-bold text-green-600">{gradedCount}명</span>{" "}
                                        채점 완료,{" "}
                                        <span className="font-bold text-orange-600">
                                            {submittedCount - gradedCount}명
                                        </span>{" "}
                                        채점 대기
                                    </div>
                                )}

                                {submissionsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : submissions.filter((s) => s.submittedAt).length > 0 ? (
                                    <div className="space-y-2">
                                        {submissions
                                            .filter((s) => s.submittedAt)
                                            .map((sub) => (
                                                <div
                                                    key={sub.id}
                                                    className="p-4 rounded-lg border hover:bg-accent/30 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">
                                                                {sub.studentName || sub.studentId}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                제출:{" "}
                                                                {new Date(sub.submittedAt!).toLocaleString(
                                                                    "ko-KR"
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {sub.score !== undefined && sub.score !== null ? (
                                                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
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
                                                                    <MessageSquare className="w-4 h-4 mr-1" />
                                                                    채점
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {sub.feedback && (
                                                        <div className="mt-2 p-2 rounded bg-blue-50 text-sm text-blue-700">
                                                            💬 {sub.feedback}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground py-8">
                                        {selectedAssignmentId
                                            ? "제출된 과제가 없습니다"
                                            : "과제를 선택하세요"}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* 채점 다이얼로그 */}
            <Dialog open={!!gradeDialog} onOpenChange={(o) => !o && setGradeDialog(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {gradeDialog?.studentName || gradeDialog?.studentId} 채점
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">점수</label>
                            <Input
                                type="number"
                                placeholder="점수 입력"
                                value={gradeScore}
                                onChange={(e) => setGradeScore(e.target.value)}
                                min={0}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">피드백</label>
                            <textarea
                                placeholder="학생에게 전달할 피드백을 작성하세요..."
                                value={gradeFeedback}
                                onChange={(e) => setGradeFeedback(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">취소</Button>
                        </DialogClose>
                        <Button onClick={handleGrade} disabled={grading || !gradeScore}>
                            {grading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            채점 완료
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
