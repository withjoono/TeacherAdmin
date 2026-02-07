"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
// Mock 데이터
// ================================
const mockStats = {
  totalClasses: 4,
  totalStudents: 48,
  pendingAssignments: 12,
  upcomingExams: 3,
  unreadMessages: 8,
};

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
  return (
    <div className="flex flex-col">
      <Header title="선생님 대시보드" />

      <div className="flex-1 p-6 space-y-6">
        {/* 상단: 통계 카드 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="전체 반"
            value={mockStats.totalClasses}
            icon={Users}
            color="bg-blue-500"
          />
          <StatsCard
            title="전체 학생"
            value={mockStats.totalStudents}
            icon={GraduationCap}
            color="bg-green-500"
          />
          <StatsCard
            title="대기 중 과제"
            value={mockStats.pendingAssignments}
            icon={ClipboardList}
            color="bg-orange-500"
          />
          <StatsCard
            title="예정된 시험"
            value={mockStats.upcomingExams}
            icon={FileText}
            color="bg-red-500"
          />
          <StatsCard
            title="읽지 않은 쪽지"
            value={mockStats.unreadMessages}
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
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    A반 - 수학 중간고사 채점 완료
                  </p>
                  <p className="text-xs text-muted-foreground">2시간 전</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    김철수 학생에게 쪽지 발송
                  </p>
                  <p className="text-xs text-muted-foreground">5시간 전</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <ClipboardList className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    B반 - 영어 숙제 제출 마감
                  </p>
                  <p className="text-xs text-muted-foreground">1일 전</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
