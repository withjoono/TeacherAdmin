"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  FileText,
  ClipboardList,
  MessageSquare,
  UserCircle,
  Home,
  GraduationCap,
  Calendar,
  CheckCircle2,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { getDashboard } from "@/lib/api/teacher";
import type { DashboardStats } from "@/lib/api/teacher";

// ================================
// 톤(색상) 정의 — 부드러운 틴트
// ================================
type Tone = "blue" | "green" | "amber" | "red" | "violet" | "teal" | "pink" | "indigo";

const toneClasses: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-rose-50 text-rose-600",
  violet: "bg-violet-50 text-violet-600",
  teal: "bg-teal-50 text-teal-600",
  pink: "bg-pink-50 text-pink-600",
  indigo: "bg-indigo-50 text-indigo-600",
};

// ================================
// 바로가기 섹션
// ================================
interface SectionItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: Tone;
}

const SECTIONS: SectionItem[] = [
  { id: "class", title: "클래스 관리", description: "반별 학생 및 수업 현황 관리", href: "/class-management", icon: Users, tone: "blue" },
  { id: "student", title: "학생 관리", description: "학생 페이지 접근, 플래너 검사, 쪽지", href: "/student-management", icon: UserCircle, tone: "green" },
  { id: "curriculum", title: "수업 계획", description: "수업 진도 계획 및 기록 관리", href: "/curriculum-management", icon: BookOpen, tone: "amber" },
  { id: "attendance", title: "출석부", description: "출결 관리 및 통계", href: "/attendance", icon: CheckCircle2, tone: "teal" },
  { id: "exam", title: "시험 관리", description: "시험 생성, 성적 입력, 결과 분석", href: "/exam-management", icon: FileText, tone: "red" },
  { id: "assignment", title: "과제 관리", description: "과제 출제, 제출 현황, 채점", href: "/assignment-management", icon: ClipboardList, tone: "violet" },
  { id: "comments", title: "비공개 코멘트", description: "학생별 비공개 채팅 (학부모 공유)", href: "/comments", icon: MessageSquare, tone: "indigo" },
  { id: "parent", title: "학부모 관리", description: "학부모 소통 및 관리", href: "/parent-management", icon: Home, tone: "pink" },
];

// ================================
// 통계 카드
// ================================
function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone: Tone;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-lg", toneClasses[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// ================================
// 바로가기 카드
// ================================
function SectionCard({ section }: { section: SectionItem }) {
  const Icon = section.icon;
  return (
    <Link
      href={section.href}
      className="group flex items-start gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", toneClasses[section.tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{section.description}</p>
      </div>
    </Link>
  );
}

// ================================
// 메인 대시보드
// ================================
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const data = await getDashboard();
        setStats(data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setStats({
          totalClasses: 0,
          totalStudents: 0,
          pendingAssignments: 0,
          upcomingExams: 0,
          unreadMessages: 0,
          todayLessons: [],
          recentActivities: [],
        });
        setError("데이터를 불러오지 못했습니다. 기본값을 표시합니다.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <PageContainer className="space-y-8">
        <PageHeader title="선생님 대시보드" description="오늘의 학습 현황을 한눈에 확인하세요." />
        <Spinner full label="대시보드를 불러오는 중..." />
      </PageContainer>
    );
  }

  const statItems: { label: string; value: number; icon: LucideIcon; tone: Tone }[] = [
    { label: "전체 반", value: stats?.totalClasses ?? 0, icon: Users, tone: "blue" },
    { label: "전체 학생", value: stats?.totalStudents ?? 0, icon: GraduationCap, tone: "green" },
    { label: "미채점 과제", value: stats?.pendingAssignments ?? 0, icon: ClipboardList, tone: "amber" },
    { label: "예정된 시험", value: stats?.upcomingExams ?? 0, icon: FileText, tone: "red" },
    { label: "읽지 않은 쪽지", value: stats?.unreadMessages ?? 0, icon: MessageSquare, tone: "violet" },
  ];

  const todayLessons = stats?.todayLessons ?? [];
  const activities = stats?.recentActivities ?? [];

  return (
    <PageContainer className="space-y-8">
      <PageHeader title="선생님 대시보드" description="오늘의 학습 현황을 한눈에 확인하세요." />

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      {/* 통계 */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statItems.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} tone={s.tone} />
        ))}
      </section>

      {/* 오늘 수업 */}
      {todayLessons.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">오늘 수업</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {todayLessons.map((lesson: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {lesson.className || lesson.title || "수업"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lesson.time || lesson.scheduledDate || ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 바로가기 */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">바로가기</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map((s) => (
            <SectionCard key={s.id} section={s} />
          ))}
        </div>
      </section>

      {/* 최근 활동 */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">최근 활동</h2>
        {activities.length > 0 ? (
          <div className="divide-y rounded-xl border bg-card">
            {activities.map((activity: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 px-4 py-3">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {activity.title || activity.description || "활동"}
                </p>
                <span className="shrink-0 text-xs text-muted-foreground">{activity.time || ""}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="최근 활동이 없습니다"
            description="학생 활동이 생기면 여기에 표시됩니다."
          />
        )}
      </section>
    </PageContainer>
  );
}
