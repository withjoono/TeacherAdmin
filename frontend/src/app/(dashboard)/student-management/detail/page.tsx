"use client";

/**
 * 학생 상세 페이지 - 학생 앱 뷰어
 * teacher-frontend에서 이식: 선생님이 학생의 학습 데이터를 열람하고 코멘트를 남기는 페이지
 * URL: /student-management/detail?id=<studentId>
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import {
  ArrowLeft,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Loader2,
  ExternalLink,
  MessageSquare,
  Send,
} from "lucide-react";
import { getLinkedAccounts, type LinkedAccount } from "@/lib/api/hub";
import { APP_LABELS, openStudentApp } from "@/lib/app-viewer";
import {
  getStudentOverview,
  getStudentAssignments,
  getStudentTests,
  getStudentAttendance,
} from "@/lib/api/student-detail";
import type {
  StudentOverview,
  StudentAssignment,
  StudentTest,
  StudentAttendanceRecord,
} from "@/lib/api/student-detail";
import {
  createHubComment,
  getHubConversation,
  markAllHubCommentsRead,
  type HubComment,
} from "@/lib/api/hub-comments";

type TabId = "overview" | "assignments" | "tests" | "attendance";

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "overview", label: "학습 요약", icon: LayoutDashboard },
  { id: "assignments", label: "과제", icon: ClipboardList },
  { id: "tests", label: "성적", icon: BarChart3 },
  { id: "attendance", label: "출석", icon: CalendarCheck },
];

export default function StudentDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col">
        <Header title="학생 상세" />
        <div className="flex-1 flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    }>
      <StudentDetailContent />
    </Suspense>
  );
}

function StudentDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentId = searchParams.get("id") || "";

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [overview, setOverview] = useState<StudentOverview | null>(null);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [tests, setTests] = useState<StudentTest[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendanceRecord[]>([]);
  const [hubComments, setHubComments] = useState<HubComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [sharedApps, setSharedApps] = useState<string[]>([]);
  const commentScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    async function fetchAll() {
      setLoading(true);
      try {
        const [ov, asgn, tst, att] = await Promise.all([
          getStudentOverview(studentId),
          getStudentAssignments(studentId),
          getStudentTests(studentId),
          getStudentAttendance(studentId),
        ]);
        setOverview(ov);
        setAssignments(asgn);
        setTests(tst);
        setAttendance(att);

        // Hub 코멘트 조회
        try {
          const convo = await getHubConversation(studentId);
          setHubComments(convo.comments);
          markAllHubCommentsRead(studentId).catch(() => {});
        } catch { /* Hub 코멘트 실패해도 기본 기능 유지 */ }

        // 공유 앱 목록 조회 (Hub API)
        try {
          const links = await getLinkedAccounts();
          const match = (Array.isArray(links) ? links : []).find(
            (l: LinkedAccount) => l.partnerId === studentId && l.partnerType === 'student'
          );
          if (match?.sharedApps) setSharedApps(match.sharedApps);
        } catch { /* Hub API 실패해도 기본 기능은 유지 */ }
      } catch (err) {
        console.error("Failed to fetch student detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [studentId]);

  const TAB_LABELS: Record<string, string> = {
    overview: "학습 요약",
    assignments: "과제 현황",
    tests: "성적 현황",
    attendance: "출석 현황",
  };

  const handleSendComment = useCallback(async () => {
    if (!commentText.trim() || !overview?.student || sending) return;
    setSending(true);
    try {
      const newComment = await createHubComment({
        target_id: overview.student.id,
        content: commentText.trim(),
        source_app: "tutorboard",
        context_type: activeTab,
        context_label: TAB_LABELS[activeTab] || activeTab,
      });
      setHubComments((prev) => [...prev, newComment]);
      setCommentText("");
      setTimeout(() => {
        commentScrollRef.current?.scrollTo(0, commentScrollRef.current.scrollHeight);
      }, 50);
    } catch (err) {
      console.error("Failed to send comment:", err);
    } finally {
      setSending(false);
    }
  }, [commentText, overview, activeTab, sending]);

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="학생 상세" />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">학생 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!studentId || !overview) {
    return (
      <div className="flex flex-col">
        <Header title="학생 상세" />
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">학생 정보를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push("/student-management")}
            className="mt-4 rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            학생 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header title="학생 상세" />
      <div className="flex-1 flex">
        {/* 좌측: 학생 데이터 */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* 상단: 학생 정보 + 뒤로가기 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/student-management")}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {overview.student.username.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold">{overview.student.username}</h2>
                <p className="text-xs text-muted-foreground">
                  {overview.classes.map((c) => `${c.name} · ${c.subject}`).join(" | ")}
                </p>
              </div>
            </div>
          </div>

          {/* 공유 앱 바로가기 */}
          {sharedApps.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center text-xs font-medium text-muted-foreground mr-1">앱 열기:</span>
              {sharedApps.map((appKey) => {
                const label = APP_LABELS[appKey];
                return (
                  <button
                    key={appKey}
                    onClick={() => openStudentApp(appKey, studentId)}
                    className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:shadow-md transition-all"
                    title={`${label?.name || appKey}을(를) 학생 시점으로 열기`}
                  >
                    <span>{label?.emoji || '📱'}</span>
                    <span>{label?.name || appKey}</span>
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </button>
                );
              })}
            </div>
          )}

          {/* 탭 네비게이션 */}
          <div className="flex gap-1 overflow-x-auto rounded-xl border bg-card p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <div>
            {activeTab === "overview" && <OverviewTab overview={overview} />}
            {activeTab === "assignments" && <AssignmentsTab assignments={assignments} />}
            {activeTab === "tests" && <TestsTab tests={tests} />}
            {activeTab === "attendance" && <AttendanceTab attendance={attendance} />}
          </div>
        </div>

        {/* 우측: 코멘트 사이드 패널 */}
        <div className="w-80 lg:w-96 border-l bg-card flex flex-col shrink-0">
          <div className="px-4 py-3 border-b flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">코멘트</h3>
            {hubComments.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {hubComments.length}
              </span>
            )}
            <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {TAB_LABELS[activeTab]}
            </span>
          </div>

          <div ref={commentScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {hubComments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">아직 코멘트가 없습니다.<br/>아래에서 코멘트를 남겨보세요.</p>
            ) : (
              hubComments.map((comment) => (
                <HubCommentBubble key={comment.id} comment={comment} />
              ))
            )}
          </div>

          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="코멘트를 입력하세요..."
              className="flex-1 rounded-full border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            />
            <button
              onClick={handleSendComment}
              disabled={!commentText.trim() || sending}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 탭 컴포넌트들 =====

function OverviewTab({ overview }: { overview: StudentOverview }) {
  const { stats } = overview;
  const assignmentRate = stats.assignments.total > 0 ? Math.round((stats.assignments.submitted / stats.assignments.total) * 100) : 0;
  const attendanceRate = stats.attendance.total > 0 ? Math.round((stats.attendance.present / stats.attendance.total) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="과제 제출률" value={`${assignmentRate}%`} sub={`${stats.assignments.submitted}/${stats.assignments.total}`} variant={assignmentRate >= 70 ? "success" : assignmentRate >= 40 ? "warning" : "danger"} />
      <StatCard label="평균 성적" value={stats.tests.avgScore !== null ? `${stats.tests.avgScore}점` : "-"} sub={`${stats.tests.count}회 응시`} variant={stats.tests.avgScore !== null && stats.tests.avgScore >= 70 ? "success" : "warning"} />
      <StatCard label="출석률" value={`${attendanceRate}%`} sub={`출석 ${stats.attendance.present} / 지각 ${stats.attendance.late} / 결석 ${stats.attendance.absent}`} variant={attendanceRate >= 90 ? "success" : attendanceRate >= 70 ? "warning" : "danger"} />
      <StatCard label="코멘트" value={`${stats.commentCount}건`} sub="선생님 ↔ 학생" variant="neutral" />

      {stats.tests.recentResults.length > 0 && (
        <div className="col-span-full rounded-xl border bg-card p-4">
          <h4 className="mb-3 text-sm font-semibold">최근 시험 결과</h4>
          <div className="space-y-2">
            {stats.tests.recentResults.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                <span className="text-sm">{r.test.title}</span>
                <span className={`text-sm font-semibold ${r.score / r.test.maxScore >= 0.7 ? "text-green-600" : "text-amber-600"}`}>{r.score}/{r.test.maxScore}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AssignmentsTab({ assignments }: { assignments: StudentAssignment[] }) {
  if (assignments.length === 0) return <EmptyState icon={ClipboardList} message="해당 학생의 과제 데이터가 없습니다." />;
  return (
    <div className="space-y-3">
      {assignments.map((a) => {
        const sub = a.submissions[0];
        const sc = getSubmissionStatusConfig(sub?.status);
        return (
          <div key={a.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{a.title}</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.lesson.class.name} · {a.lesson.title}</p>
                {a.description && <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>}
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${sc.classes}`}><sc.icon className="h-3 w-3" />{sc.label}</span>
            </div>
            {sub && (
              <div className="mt-3 flex items-center gap-4 border-t pt-3">
                {sub.grade != null && <span className="text-sm text-muted-foreground">점수: <strong className="text-primary">{sub.grade}</strong></span>}
                {sub.feedback && <span className="text-sm text-muted-foreground">피드백: {sub.feedback}</span>}
                <span className="ml-auto text-xs text-muted-foreground">{new Date(sub.submittedAt).toLocaleDateString("ko-KR")}</span>
              </div>
            )}
            {a.dueDate && !sub && <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />마감: {new Date(a.dueDate).toLocaleDateString("ko-KR")}</div>}
          </div>
        );
      })}
    </div>
  );
}

function TestsTab({ tests }: { tests: StudentTest[] }) {
  if (tests.length === 0) return <EmptyState icon={BarChart3} message="해당 학생의 시험 데이터가 없습니다." />;
  return (
    <div className="space-y-3">
      {tests.map((t) => {
        const r = t.results[0];
        const pct = r ? Math.round((r.score / t.maxScore) * 100) : null;
        return (
          <div key={t.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between">
              <div><h4 className="font-medium">{t.title}</h4><p className="mt-0.5 text-xs text-muted-foreground">{t.lesson.class.name} · {t.lesson.title}</p></div>
              {r ? (
                <div className="text-right">
                  <div className={`text-lg font-bold ${pct! >= 70 ? "text-green-600" : pct! >= 40 ? "text-amber-600" : "text-red-600"}`}>{r.score}<span className="text-sm text-muted-foreground">/{t.maxScore}</span></div>
                  <div className="text-xs text-muted-foreground">{pct}%</div>
                </div>
              ) : <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">미응시</span>}
            </div>
            {r && (
              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full transition-all ${pct! >= 70 ? "bg-green-500" : pct! >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} /></div>
                {r.feedback && <p className="mt-2 text-sm text-muted-foreground">💬 {r.feedback}</p>}
                {r.wrongAnswerNote && <p className="mt-1 text-sm text-muted-foreground">📝 {r.wrongAnswerNote}</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AttendanceTab({ attendance }: { attendance: StudentAttendanceRecord[] }) {
  if (attendance.length === 0) return <EmptyState icon={CalendarCheck} message="해당 학생의 출석 데이터가 없습니다." />;
  const sm = { present: { label: "출석", icon: CheckCircle, classes: "bg-green-100 text-green-700" }, late: { label: "지각", icon: AlertCircle, classes: "bg-amber-100 text-amber-700" }, absent: { label: "결석", icon: XCircle, classes: "bg-red-100 text-red-700" } };
  const grouped = attendance.reduce<Record<string, StudentAttendanceRecord[]>>((acc, r) => { const m = new Date(r.date).toLocaleDateString("ko-KR", { year: "numeric", month: "long" }); (acc[m] ??= []).push(r); return acc; }, {});
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {(["present", "late", "absent"] as const).map((s) => { const c = attendance.filter((a) => a.status === s).length; const cfg = sm[s]; return (<div key={s} className="rounded-xl border bg-card p-3 text-center"><cfg.icon className={`mx-auto mb-1 h-5 w-5 ${cfg.classes.split(" ")[1]}`} /><div className="text-xl font-bold">{c}</div><div className="text-xs text-muted-foreground">{cfg.label}</div></div>); })}
      </div>
      {Object.entries(grouped).map(([month, records]) => (
        <div key={month}>
          <h4 className="mb-2 text-sm font-semibold text-muted-foreground">{month}</h4>
          <div className="space-y-1">
            {records.map((r) => { const cfg = sm[r.status]; return (
              <div key={r.id} className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.classes}`}><cfg.icon className="h-3 w-3" />{cfg.label}</span>
                <span className="text-sm">{new Date(r.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric", weekday: "short" })}</span>
                <span className="text-xs text-muted-foreground">{r.class.name}</span>
                {r.note && <span className="ml-auto text-xs text-muted-foreground">{r.note}</span>}
              </div>
            ); })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== 헬퍼 =====

function StatCard({ label, value, sub, variant }: { label: string; value: string; sub: string; variant: "success" | "warning" | "danger" | "neutral" }) {
  const vm = { success: { bg: "border-green-200 bg-green-50", v: "text-green-700" }, warning: { bg: "border-amber-200 bg-amber-50", v: "text-amber-700" }, danger: { bg: "border-red-200 bg-red-50", v: "text-red-700" }, neutral: { bg: "border bg-card", v: "text-foreground" } };
  const s = vm[variant];
  return (<div className={`rounded-xl border p-4 ${s.bg}`}><p className="text-xs font-medium text-muted-foreground">{label}</p><p className={`mt-1 text-2xl font-bold ${s.v}`}>{value}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p></div>);
}

function HubCommentBubble({ comment }: { comment: HubComment }) {
  const isTeacher = comment.authorRole === "teacher" || comment.authorRole === "academy";
  return (
    <div className={`flex ${isTeacher ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isTeacher ? "bg-primary text-primary-foreground shadow-md" : "border bg-secondary text-secondary-foreground"}`}>
        {comment.contextLabel && (
          <div className={`flex items-center gap-1 text-[10px] mb-1 ${isTeacher ? "opacity-60" : "text-muted-foreground"}`}>
            <span>📌</span>
            <span>{comment.contextLabel}</span>
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
        <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isTeacher ? "opacity-60" : "text-muted-foreground"}`}>
          <Clock className="h-2.5 w-2.5" />
          {new Date(comment.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (<div className="flex flex-col items-center justify-center rounded-xl border bg-card py-12"><Icon className="mb-3 h-10 w-10 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">{message}</p></div>);
}

function getSubmissionStatusConfig(status?: string) {
  switch (status) {
    case "graded": return { label: "채점 완료", icon: CheckCircle, classes: "bg-green-100 text-green-700" };
    case "submitted": return { label: "제출됨", icon: FileText, classes: "bg-blue-100 text-blue-700" };
    default: return { label: "미제출", icon: AlertCircle, classes: "bg-secondary text-muted-foreground" };
  }
}
