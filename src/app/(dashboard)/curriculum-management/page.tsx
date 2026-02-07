"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  ClipboardList,
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Eye,
  Share2,
  TrendingUp,
  Users,
  BarChart3,
  Copy,
  Link as LinkIcon,
  Pencil,
} from "lucide-react";

import type {
  LessonPlan,
  Assignment,
  CreateLessonPlanDto,
  UpdateLessonPlanDto,
  CreateAssignmentDto,
} from "@/lib/api/curriculum";
import {
  getLessonPlans,
  createLessonPlan,
  updateLessonPlan,
  deleteLessonPlan,
  getAssignments,
  createAssignment,
  deleteAssignment,
} from "@/lib/api/curriculum";

import { LessonPlanForm } from "./_components/lesson-plan-form";
import { AssignmentForm } from "./_components/assignment-form";
import { ProgressEditDialog } from "./_components/progress-edit-dialog";
import { SubmissionDetail } from "./_components/submission-detail";

// ================================
// Mock 클래스 데이터 (mentoring API 연동 시 교체)
// ================================
const mockClasses = [
  { id: "class-a", name: "A반", studentCount: 12, subject: "수학" },
  { id: "class-b", name: "B반", studentCount: 15, subject: "영어" },
  { id: "class-c", name: "C반", studentCount: 11, subject: "국어" },
];

// ================================
// 유틸리티
// ================================
const getStatusColor = (status: string) => {
  switch (status) {
    case "완료":
      return "bg-green-100 text-green-700 border-green-200";
    case "진행중":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "예정":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "완료":
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case "진행중":
      return <Clock className="w-4 h-4 text-blue-600" />;
    case "예정":
      return <Calendar className="w-4 h-4 text-gray-500" />;
    default:
      return null;
  }
};

// ================================
// 메인 페이지
// ================================
export default function CurriculumManagementPage() {
  const [selectedClass, setSelectedClass] = useState(mockClasses[0].id);
  const [lessons, setLessons] = useState<LessonPlan[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Progress edit dialog
  const [editingLesson, setEditingLesson] = useState<LessonPlan | null>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);

  // Submission detail dialog
  const [viewingAssignment, setViewingAssignment] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);

  // Share
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedClassName =
    mockClasses.find((c) => c.id === selectedClass)?.name ?? "";

  // 수업 진도 로드
  const loadLessons = useCallback(async () => {
    setLoadingLessons(true);
    try {
      const data = await getLessonPlans(selectedClass);
      setLessons(data);
    } finally {
      setLoadingLessons(false);
    }
  }, [selectedClass]);

  // 과제 로드
  const loadAssignments = useCallback(async () => {
    setLoadingAssignments(true);
    try {
      const data = await getAssignments(selectedClass);
      setAssignments(data);
    } finally {
      setLoadingAssignments(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    loadLessons();
    loadAssignments();
  }, [loadLessons, loadAssignments]);

  // 수업 계획 추가
  const handleCreateLesson = async (data: CreateLessonPlanDto) => {
    setActionLoading(true);
    try {
      await createLessonPlan(data);
      await loadLessons();
    } finally {
      setActionLoading(false);
    }
  };

  // 수업 진도 업데이트
  const handleUpdateLesson = async (id: number, data: UpdateLessonPlanDto) => {
    setActionLoading(true);
    try {
      await updateLessonPlan(id, selectedClass, data);
      await loadLessons();
      setProgressDialogOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  // 수업 삭제
  const handleDeleteLesson = async (id: number) => {
    if (!confirm("이 수업 계획을 삭제하시겠습니까?")) return;
    setActionLoading(true);
    try {
      await deleteLessonPlan(id, selectedClass);
      await loadLessons();
    } finally {
      setActionLoading(false);
    }
  };

  // 과제 추가
  const handleCreateAssignment = async (data: CreateAssignmentDto) => {
    setActionLoading(true);
    try {
      await createAssignment(data);
      await loadAssignments();
    } finally {
      setActionLoading(false);
    }
  };

  // 과제 삭제
  const handleDeleteAssignment = async (id: number) => {
    if (!confirm("이 과제를 삭제하시겠습니까?")) return;
    setActionLoading(true);
    try {
      await deleteAssignment(id, selectedClass);
      await loadAssignments();
    } finally {
      setActionLoading(false);
    }
  };

  // 공유 링크 생성 (Mock)
  const handleCreateShareLink = () => {
    const token = Math.random().toString(36).substring(2, 10);
    const link = `${window.location.origin}/shared/${token}`;
    setShareLink(link);
    setCopied(false);
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 요약 통계
  const completedLessons = lessons.filter((l) => l.status === "완료").length;
  const inProgressLessons = lessons.filter(
    (l) => l.status === "진행중"
  ).length;
  const avgProgress =
    lessons.length > 0
      ? Math.round(
        lessons.reduce((sum, l) => sum + l.progress, 0) / lessons.length
      )
      : 0;
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(
    (a) => a.status === "완료"
  ).length;

  return (
    <div className="flex flex-col">
      <Header title="수업 현황 관리" />

      <div className="flex-1 p-6 space-y-6">
        {/* 반 선택 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">클래스 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {mockClasses.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${cls.id === selectedClass
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted hover:bg-muted/80"
                    }`}
                >
                  {cls.name}
                  <span className="ml-1.5 text-xs opacity-80">
                    ({cls.studentCount}명 · {cls.subject})
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 요약 통계 */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">전체 수업</p>
                  <p className="text-xl font-bold">{lessons.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">완료</p>
                  <p className="text-xl font-bold">{completedLessons}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">평균 진도</p>
                  <p className="text-xl font-bold">{avgProgress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <ClipboardList className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">과제</p>
                  <p className="text-xl font-bold">{totalAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">과제 완료</p>
                  <p className="text-xl font-bold">
                    {completedAssignments}/{totalAssignments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 관리 탭 */}
        <Tabs defaultValue="lessons" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lessons">
              <BookOpen className="w-4 h-4 mr-2" />
              수업 진도
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <ClipboardList className="w-4 h-4 mr-2" />
              과제 관리
            </TabsTrigger>
            <TabsTrigger value="share">
              <Share2 className="w-4 h-4 mr-2" />
              공유
            </TabsTrigger>
          </TabsList>

          {/* ==================== 수업 진도 탭 ==================== */}
          <TabsContent value="lessons" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedClassName} - 주차별 수업 진도
                  </CardTitle>
                  <LessonPlanForm
                    classId={selectedClass}
                    onSubmit={handleCreateLesson}
                    isLoading={actionLoading}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loadingLessons ? (
                  <p className="text-center py-8 text-muted-foreground">
                    로딩 중...
                  </p>
                ) : lessons.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mb-3 opacity-40" />
                    <p className="text-lg font-medium">
                      등록된 수업 계획이 없습니다
                    </p>
                    <p className="text-sm">
                      &quot;수업 계획 추가&quot; 버튼을 눌러 첫 수업을
                      등록하세요
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="p-4 rounded-lg border hover:bg-accent/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                              {lesson.week}주
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold">
                                  {lesson.title}
                                </p>
                                <span
                                  className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(
                                    lesson.status
                                  )}`}
                                >
                                  {lesson.status}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {lesson.subject} · {lesson.scheduledDate}
                              </p>
                              {lesson.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {lesson.description}
                                </p>
                              )}

                              {/* 진도 바 */}
                              {lesson.status !== "예정" && (
                                <div className="mt-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${lesson.progress >= 100
                                            ? "bg-green-500"
                                            : "bg-blue-500"
                                          }`}
                                        style={{
                                          width: `${lesson.progress}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-sm font-semibold text-muted-foreground w-12 text-right">
                                      {lesson.progress}%
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-4">
                            {getStatusIcon(lesson.status)}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingLesson(lesson);
                                setProgressDialogOpen(true);
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5 mr-1" />
                              수정
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== 과제 관리 탭 ==================== */}
          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedClassName} - 과제 목록
                  </CardTitle>
                  <AssignmentForm
                    classId={selectedClass}
                    onSubmit={handleCreateAssignment}
                    isLoading={actionLoading}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loadingAssignments ? (
                  <p className="text-center py-8 text-muted-foreground">
                    로딩 중...
                  </p>
                ) : assignments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <ClipboardList className="w-12 h-12 mb-3 opacity-40" />
                    <p className="text-lg font-medium">
                      등록된 과제가 없습니다
                    </p>
                    <p className="text-sm">
                      &quot;새 과제 추가&quot; 버튼을 눌러 첫 과제를
                      등록하세요
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="p-4 rounded-lg border hover:bg-accent/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold">
                                {assignment.title}
                              </p>
                              <span
                                className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(
                                  assignment.status
                                )}`}
                              >
                                {assignment.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {assignment.subject} · 마감:{" "}
                              {assignment.dueDate}
                            </p>
                            {assignment.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {assignment.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setViewingAssignment({
                                  id: assignment.id,
                                  title: assignment.title,
                                });
                                setSubmissionDialogOpen(true);
                              }}
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              제출현황
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteAssignment(assignment.id)
                              }
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* 제출률 + 평균점수 */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                제출률
                              </p>
                              <Users className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <div className="flex items-baseline gap-1 mt-1">
                              <p className="text-2xl font-bold text-blue-600">
                                {assignment.totalStudents > 0
                                  ? Math.round(
                                    (assignment.submissionCount /
                                      assignment.totalStudents) *
                                    100
                                  )
                                  : 0}
                                %
                              </p>
                              <span className="text-xs text-muted-foreground">
                                ({assignment.submissionCount}/
                                {assignment.totalStudents})
                              </span>
                            </div>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                평균 점수
                              </p>
                              <BarChart3 className="w-3.5 h-3.5 text-green-500" />
                            </div>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                              {assignment.avgScore
                                ? `${assignment.avgScore}점`
                                : "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== 공유 탭 ==================== */}
          <TabsContent value="share" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  {selectedClassName} - 수업현황 공유
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-4">
                    학부모 또는 학생에게 수업 현황을 공유할 수 있습니다.
                    <br />
                    공유 링크를 통해 수업 진도와 과제 현황을 확인할 수
                    있습니다.
                  </p>
                  <Button onClick={handleCreateShareLink}>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    공유 링크 생성
                  </Button>
                </div>

                {shareLink && (
                  <div className="p-4 border rounded-lg space-y-3">
                    <p className="text-sm font-medium">생성된 공유 링크</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono truncate">
                        {shareLink}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        {copied ? "복사됨!" : "복사"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      이 링크로 접속하면 {selectedClassName}의 수업 진도와 과제
                      현황을 확인할 수 있습니다.
                    </p>
                  </div>
                )}

                {/* 공유 현황 요약 */}
                <div>
                  <p className="text-sm font-medium mb-3">
                    공유 시 표시되는 정보 미리보기
                  </p>
                  <div className="border rounded-lg p-4 space-y-4 bg-white">
                    <div className="text-center pb-3 border-b">
                      <p className="text-lg font-bold">
                        {selectedClassName} 수업 현황
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString("ko-KR")} 기준
                      </p>
                    </div>

                    {/* 진도 요약 */}
                    <div>
                      <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        수업 진도
                      </p>
                      <div className="space-y-2">
                        {lessons.slice(0, 3).map((l) => (
                          <div
                            key={l.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>
                              {l.week}주 · {l.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(
                                l.status
                              )}`}
                            >
                              {l.status} ({l.progress}%)
                            </span>
                          </div>
                        ))}
                        {lessons.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{lessons.length - 3}개 더 보기
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 과제 요약 */}
                    <div>
                      <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <ClipboardList className="w-4 h-4" />
                        과제 현황
                      </p>
                      <div className="space-y-2">
                        {assignments.slice(0, 3).map((a) => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>{a.title}</span>
                            <span className="text-xs text-muted-foreground">
                              마감: {a.dueDate}
                            </span>
                          </div>
                        ))}
                        {assignments.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{assignments.length - 3}개 더 보기
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <ProgressEditDialog
        lesson={editingLesson}
        open={progressDialogOpen}
        onOpenChange={setProgressDialogOpen}
        onSubmit={handleUpdateLesson}
        isLoading={actionLoading}
      />

      <SubmissionDetail
        assignmentId={viewingAssignment?.id ?? null}
        assignmentTitle={viewingAssignment?.title ?? ""}
        open={submissionDialogOpen}
        onOpenChange={setSubmissionDialogOpen}
      />
    </div>
  );
}
