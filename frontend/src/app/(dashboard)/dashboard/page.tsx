"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ClipboardList,
  FileText,
  MessageSquare,
  PenLine,
  Users,
  Plus,
  School,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { getDashboard, getWeekSchedule, getMyClasses } from "@/lib/api/teacher";
import type { DashboardStats, WeekSchedule, ClassInfo } from "@/lib/api/teacher";
import { getPendingGrading, listTeacherExams } from "@/lib/api/teacher-exam";

// ================================
// 헬퍼
// ================================
function todayLabel() {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

interface TodoItem {
  icon: LucideIcon;
  tone: string;
  label: string;
  count: number;
  href: string;
}

// ================================
// 작은 부품들
// ================================
function TodoCard({ item }: { item: TodoItem }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
          item.tone,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{item.label}</p>
        <p className="mt-0.5 text-2xl font-bold leading-tight text-foreground">
          {item.count}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function QuickAction({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:bg-accent/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </Link>
  );
}

function TodayLessonCard({ lesson }: { lesson: any }) {
  const className = lesson.className || "수업";
  const subject = lesson.subject || lesson.classSubject || null;
  const timeRange =
    lesson.startTime || lesson.endTime
      ? `${lesson.startTime ?? "?"} ~ ${lesson.endTime ?? "?"}`
      : null;
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{className}</p>
            {subject && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                {subject}
              </span>
            )}
          </div>
          {lesson.title && (
            <p className="mt-0.5 text-xs text-muted-foreground">{lesson.title}</p>
          )}
          {(timeRange || lesson.textbook || lesson.totalSessions != null) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              {timeRange && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {timeRange}
                </span>
              )}
              {lesson.textbook && (
                <span className="inline-flex items-center gap-1">
                  📖 {lesson.textbook}
                </span>
              )}
              {lesson.totalSessions != null && (
                <span>총 {lesson.totalSessions}회차</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 sm:justify-end">
        <Link
          href="/attendance"
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        >
          출석 체크
        </Link>
        <Link
          href="/lesson-records"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          수업 기록
        </Link>
      </div>
    </div>
  );
}

function WeekCalendar({ schedule }: { schedule: WeekSchedule }) {
  const today = new Date().toISOString().slice(0, 10);
  const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">이번 주 일정</h3>
        <span className="text-xs text-muted-foreground">
          {schedule.weekStart} ~ {schedule.weekEnd}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {schedule.days.map((d, idx) => {
          const isToday = d.date === today;
          const dayNum = parseInt(d.date.split("-")[2] ?? "0", 10);
          return (
            <div
              key={d.date}
              className={cn(
                "rounded-lg border p-2 text-center transition-colors",
                isToday
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background",
              )}
            >
              <p
                className={cn(
                  "text-[10px] font-medium",
                  isToday ? "text-primary" : "text-muted-foreground",
                )}
              >
                {WEEKDAYS[idx] ?? ""}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-sm font-semibold",
                  isToday ? "text-primary" : "text-foreground",
                )}
              >
                {dayNum}
              </p>
              <div className="mt-1 flex h-2 items-center justify-center gap-0.5">
                {d.lessons > 0 && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-blue-500"
                    title={`수업 ${d.lessons}`}
                  />
                )}
                {d.assignments > 0 && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                    title={`과제 ${d.assignments}`}
                  />
                )}
                {d.tests > 0 && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-rose-500"
                    title={`시험 ${d.tests}`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> 수업
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 과제 마감
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> 시험
        </span>
      </div>
    </div>
  );
}

function ClassesGrid({ classes }: { classes: ClassInfo[] }) {
  if (classes.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <School className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">아직 만든 반이 없습니다</p>
        <p className="mt-0.5 text-xs text-muted-foreground">반을 만들고 학생을 추가하면 모든 기능이 열립니다.</p>
        <Link
          href="/classes"
          className={cn(buttonVariants({ size: "sm" }), "mt-3")}
        >
          + 반 만들기
        </Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {classes.map((c) => (
        <Link
          key={c.id}
          href="/classes"
          className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
              {c.subject && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                  {c.subject}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              학생 {c.studentCount}명
              {typeof c.weeklyLessonCount === "number" && c.weeklyLessonCount > 0 && (
                <span> · 이번 주 {c.weeklyLessonCount}회</span>
              )}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
      <Link
        href="/classes"
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed bg-card p-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <Plus className="h-4 w-4" /> 반 만들기
      </Link>
    </div>
  );
}

function NextLessonCard({ next }: { next: NonNullable<DashboardStats["nextLesson"]> }) {
  const dateStr = (() => {
    try {
      const d = new Date(next.scheduledDate);
      return d.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
      });
    } catch {
      return next.scheduledDate;
    }
  })();
  const time =
    next.startTime || next.endTime
      ? `${next.startTime ?? "?"} ~ ${next.endTime ?? "?"}`
      : null;
  const subject = next.subject || next.classSubject || null;
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">다음 수업</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-foreground">
          {next.className || "수업"}
        </p>
        {subject && (
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
            {subject}
          </span>
        )}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{dateStr}</span>
        {time && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {time}
          </span>
        )}
        {next.textbook && <span>📖 {next.textbook}</span>}
      </div>
    </div>
  );
}

function PendingCommentList({
  items,
}: {
  items: NonNullable<DashboardStats["pendingCommentStudents"]>;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <Bell className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">관심이 필요한 학생이 없습니다</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          학생이 코멘트를 보내면 여기에 표시됩니다.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <Link
          key={it.studentId}
          href="/comments"
          className="group flex items-start gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {it.studentName} · 답장 대기
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {it.content}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}

// ================================
// 메인 페이지
// ================================
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingGradingCount, setPendingGradingCount] = useState(0);
  const [draftExamsCount, setDraftExamsCount] = useState(0);
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [dashboard, pending, exams, week, myClasses] = await Promise.all([
          getDashboard(),
          getPendingGrading().catch(() => []),
          listTeacherExams().catch(() => []),
          getWeekSchedule(),
          getMyClasses().catch(() => [] as ClassInfo[]),
        ]);
        setStats(dashboard);
        setPendingGradingCount(pending.length);
        setDraftExamsCount(exams.filter((e) => e.status === "draft").length);
        setWeekSchedule(week);
        setClasses(myClasses);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("일부 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <PageContainer className="space-y-8">
        <PageHeader title="선생님 대시보드" description={todayLabel()} />
        <Spinner full label="불러오는 중..." />
      </PageContainer>
    );
  }

  const todayLessons = stats?.todayLessons ?? [];
  const todos: TodoItem[] = [
    {
      icon: PenLine,
      tone: "bg-violet-50 text-violet-600",
      label: "주관식 채점 대기",
      count: pendingGradingCount,
      href: "/exams/grading",
    },
    {
      icon: ClipboardList,
      tone: "bg-amber-50 text-amber-600",
      label: "미채점 과제",
      count: stats?.pendingAssignments ?? 0,
      href: "/assignment-management",
    },
    {
      icon: MessageSquare,
      tone: "bg-indigo-50 text-indigo-600",
      label: "미확인 코멘트",
      count: stats?.unreadMessages ?? 0,
      href: "/comments",
    },
    {
      icon: FileText,
      tone: "bg-secondary text-muted-foreground",
      label: "임시저장 시험",
      count: draftExamsCount,
      href: "/exams",
    },
  ].filter((t) => t.count > 0);

  return (
    <PageContainer className="space-y-8">
      <PageHeader title="선생님 대시보드" description={todayLabel()} />

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      {/* HERO — 오늘의 수업 */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Clock className="h-4 w-4" />
          오늘의 수업
        </h2>
        {todayLessons.length === 0 ? (
          stats?.nextLesson ? (
            <NextLessonCard next={stats.nextLesson} />
          ) : (
            <EmptyState
              icon={Calendar}
              title="오늘은 수업이 없습니다"
              description="수업 계획에 날짜를 적은 수업이 그 날 시간순으로 표시됩니다."
            />
          )
        ) : (
          <div className="space-y-2">
            {todayLessons.map((l: any, idx: number) => (
              <TodayLessonCard key={l.id ?? idx} lesson={l} />
            ))}
          </div>
        )}
      </section>

      {/* 할 일 + 빠른 액션 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">할 일</h2>
          {todos.length === 0 ? (
            <div className="rounded-xl border bg-card p-6 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-500" />
              <p className="text-sm font-medium text-foreground">모두 처리 완료</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                새 작업이 생기면 여기에 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {todos.map((t) => (
                <TodoCard key={t.label} item={t} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">빠른 액션</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <QuickAction href="/exams/new" label="새 시험 출제" icon={FileText} />
            <QuickAction
              href="/assignment-management"
              label="새 과제"
              icon={ClipboardList}
            />
            <QuickAction
              href="/curriculum-management"
              label="수업 계획"
              icon={Calendar}
            />
            <QuickAction
              href="/lesson-records"
              label="수업 기록"
              icon={PenLine}
            />
          </div>
        </section>
      </div>

      {/* 이번 주 일정 */}
      {weekSchedule && <WeekCalendar schedule={weekSchedule} />}

      {/* 내 반 */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">내 반</h2>
        <ClassesGrid classes={classes} />
      </section>

      {/* 관심 학생 */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Bell className="h-4 w-4" />
          관심 학생
        </h2>
        <PendingCommentList items={stats?.pendingCommentStudents ?? []} />
      </section>
    </PageContainer>
  );
}
