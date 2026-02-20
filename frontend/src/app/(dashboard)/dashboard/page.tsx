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
  Clock,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { getDashboard } from "@/lib/api/teacher";
import type { DashboardStats } from "@/lib/api/teacher";

// ================================
// 대시보드 섹션 데이터
// ================================
const dashboardSections = [
  {
    id: "class",
    title: "클래스 관리",
    icon: Users,
    description: "반별 학생 및 수업 현황 관리",
    href: "/class-management",
  },
  {
    id: "student",
    title: "학생 관리",
    icon: UserCircle,
    description: "학생 페이지 접근, 플래너 검사, 쪽지",
    href: "/student-management",
  },
  {
    id: "curriculum",
    title: "수업 계획",
    icon: BookOpen,
    description: "수업 진도 계획 및 기록 관리",
    href: "/curriculum-management",
  },
  {
    id: "attendance",
    title: "출석부",
    icon: CheckCircle2,
    description: "출결 관리 및 통계",
    href: "/attendance",
  },
  {
    id: "exam",
    title: "시험 관리",
    icon: FileText,
    description: "시험 생성, 성적 입력, 결과 분석",
    href: "/exam-management",
  },
  {
    id: "assignment",
    title: "과제 관리",
    icon: ClipboardList,
    description: "과제 출제, 제출 현황, 채점",
    href: "/assignment-management",
  },
  {
    id: "comments",
    title: "비공개 코멘트",
    icon: MessageSquare,
    description: "학생별 비공개 채팅 (학부모 공유)",
    href: "/comments",
  },
  {
    id: "parent",
    title: "학부모 관리",
    icon: Home,
    description: "학부모 소통 및 관리",
    href: "/parent-management",
  },
];

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
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

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
        <h1 className="gb-page-title">대시보드</h1>
        <p className="gb-page-desc">학급 현황을 한눈에 확인하세요</p>
      </div>

      {error && (
        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-warning-bg)",
            color: "var(--color-warning)",
            fontSize: "var(--text-sm)",
          }}
        >
          ⚠️ {error} (기본값이 표시됩니다)
        </div>
      )}

      {/* 상단: 통계 카드 */}
      <div className="gb-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
        <StatCard label="전체 반" value={stats?.totalClasses ?? 0} icon={Users} />
        <StatCard label="전체 학생" value={stats?.totalStudents ?? 0} icon={GraduationCap} />
        <StatCard label="미채점 과제" value={stats?.pendingAssignments ?? 0} icon={ClipboardList} />
        <StatCard label="예정된 시험" value={stats?.upcomingExams ?? 0} icon={FileText} />
        <StatCard label="읽지 않은 쪽지" value={stats?.unreadMessages ?? 0} icon={MessageSquare} />
      </div>

      {/* 오늘 수업 */}
      {stats?.todayLessons && stats.todayLessons.length > 0 && (
        <div className="gb-card">
          <div className="gb-row gb-row-2" style={{ marginBottom: "var(--space-4)" }}>
            <Clock style={{ width: 18, height: 18, color: "var(--color-primary)" }} />
            <span className="gb-card-title" style={{ marginBottom: 0 }}>오늘 수업</span>
          </div>
          <div className="gb-stack gb-stack-2">
            {stats.todayLessons.map((lesson: any, idx: number) => (
              <div
                key={idx}
                className="gb-row gb-row-3"
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-primary-50, var(--color-bg-secondary))",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--color-primary-100, var(--color-bg-secondary))",
                  }}
                >
                  <BookOpen style={{ width: 18, height: 18, color: "var(--color-primary)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text)" }}>
                    {lesson.className || lesson.title || "수업"}
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
                    {lesson.time || lesson.scheduledDate || ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 메인: 관리 섹션 카드 */}
      <div>
        <h2 className="gb-section-title">관리 메뉴</h2>
        <div className="gb-grid gb-grid-4">
          {dashboardSections.map((section) => (
            <Link key={section.id} href={section.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div
                className="gb-card"
                style={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "box-shadow var(--transition-normal), transform var(--transition-normal)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-lg)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-sm)";
                }}
              >
                <div className="gb-row gb-row-3" style={{ marginBottom: "var(--space-3)" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-primary-50, var(--color-bg-secondary))",
                    }}
                  >
                    <section.icon style={{ width: 20, height: 20, color: "var(--color-primary)" }} />
                  </div>
                  <span
                    style={{
                      fontSize: "var(--text-lg)",
                      fontWeight: "var(--weight-bold)",
                      color: "var(--color-text)",
                    }}
                  >
                    {section.title}
                  </span>
                </div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)", lineHeight: "var(--leading-relaxed)" }}>
                  {section.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 하단: 최근 활동 */}
      <div className="gb-card">
        <div className="gb-card-title">최근 활동</div>
        <div className="gb-stack gb-stack-1" style={{ marginTop: "var(--space-4)" }}>
          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity: any, idx: number) => (
              <div
                key={idx}
                className="gb-list-item"
                style={{ cursor: "default", borderTop: idx === 0 ? "1px solid var(--color-border-light)" : "none" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flex: 1 }}>
                  <Calendar style={{ width: 18, height: 18, color: "var(--color-text-tertiary)", flexShrink: 0 }} />
                  <div className="gb-list-item-content">
                    <div className="gb-list-item-title">{activity.title || activity.description || "활동"}</div>
                    <div className="gb-list-item-meta">{activity.time || ""}</div>
                  </div>
                </div>
                <ChevronRight style={{ width: 16, height: 16, color: "var(--color-text-disabled)" }} />
              </div>
            ))
          ) : (
            <div className="gb-empty-state" style={{ padding: "var(--space-8) var(--space-4)" }}>
              <div className="gb-empty-icon">📋</div>
              <div className="gb-empty-title">최근 활동이 없습니다</div>
              <div className="gb-empty-desc">수업이나 과제를 시작하면 여기에 활동 내역이 표시됩니다</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ================================
// 통계 카드 컴포넌트
// ================================
function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) {
  return (
    <div className="gb-stat-card">
      <div className="gb-stat-label">{label}</div>
      <div className="gb-row gb-row-3" style={{ justifyContent: "space-between" }}>
        <div className="gb-stat-value">
          {value}
          <span className="gb-stat-unit">건</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: "var(--radius-full)",
            background: "var(--color-primary-50, var(--color-bg-secondary))",
          }}
        >
          <Icon style={{ width: 20, height: 20, color: "var(--color-primary)" }} />
        </div>
      </div>
    </div>
  );
}
