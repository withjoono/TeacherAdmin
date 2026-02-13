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
  Loader2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboard, getMyClasses } from "@/lib/api/teacher";
import type { DashboardStats, ClassInfo } from "@/lib/api/teacher";

// ================================
// 타입 정의
// ================================
interface DashboardSection {
  id: string;
  title: string;
  icon: any;
  description: string;
  href: string;
  color: string;
}

// ================================
// 대시보드 섹션 데이터
// ================================
const dashboardSections: DashboardSection[] = [
  {
    id: "class",
    title: "클래스 관리",
    icon: Users,
    description: "반별 학생 및 수업 현황 관리",
    href: "/class-management",
    color: "bg-blue-500",
  },
  {
    id: "student",
    title: "학생 관리",
    icon: UserCircle,
    description: "학생 페이지 접근, 플래너 검사, 쪽지",
    href: "/student-management",
    color: "bg-green-500",
  },
  {
    id: "parent",
    title: "학부모 관리",
    icon: Home,
    description: "학부모 소통 및 관리",
    href: "/parent-management",
    color: "bg-purple-500",
  },
  {
    id: "curriculum",
    title: "수업 현황 관리",
    icon: BookOpen,
    description: "수업 진도 계획 및 과제 관리",
    href: "/curriculum-management",
    color: "bg-orange-500",
  },
  {
    id: "exam",
    title: "테스트",
    icon: FileText,
    description: "시험 관리, 문제 업로드, 채점",
    href: "/exam-management",
    color: "bg-red-500",
  },
];

// ================================
// 통계 카드 컴포넌트
// ================================
function StatsCard({ title, value, icon: Icon, color }: {
  title: string;
  value: number | string;
  icon: any;
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
          </div>
          <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ================================
// 메인 대시보드 페이지
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
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        // Fallback to default stats on error
        setStats({
          totalClasses: 0,
          totalStudents: 0,
          pendingAssignments: 0,
          upcomingExams: 0,
          unreadMessages: 0,
          todayLessons: [],
          recentActivities: [],
        });
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="선생님 대시보드" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header title="선생님 대시보드" />

      <div className="flex-1 p-6 space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
            ⚠️ {error} (기본값이 표시됩니다)
          </div>
        )}

        {/* 상단: 통계 카드 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="전체 반"
            value={stats?.totalClasses ?? 0}
            icon={Users}
            color="bg-blue-500"
          />
          <StatsCard
            title="전체 학생"
            value={stats?.totalStudents ?? 0}
            icon={GraduationCap}
            color="bg-green-500"
          />
          <StatsCard
            title="대기 중 과제"
            value={stats?.pendingAssignments ?? 0}
            icon={ClipboardList}
            color="bg-orange-500"
          />
          <StatsCard
            title="예정된 시험"
            value={stats?.upcomingExams ?? 0}
            icon={FileText}
            color="bg-red-500"
          />
          <StatsCard
            title="읽지 않은 쪽지"
            value={stats?.unreadMessages ?? 0}
            icon={MessageSquare}
            color="bg-purple-500"
          />
        </div>

        {/* 메인: 관리 섹션 카드 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dashboardSections.map((section) => (
            <Link key={section.id} href={section.href}>
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-lg ${section.color} bg-opacity-10`}
                    >
                      <section.icon
                        className={`h-6 w-6 ${section.color.replace("bg-", "text-")}`}
                      />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* 하단: 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.recentActivities && stats.recentActivities.length > 0) ? (
                stats.recentActivities.map((activity: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.title || activity.description || '활동'}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time || ''}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground py-4">
                  최근 활동이 없습니다
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
