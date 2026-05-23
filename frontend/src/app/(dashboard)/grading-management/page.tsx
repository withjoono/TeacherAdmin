"use client";

import { useState } from "react";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  FileText,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Mock 데이터
const mockGradingTasks = [
  {
    id: 1,
    examTitle: "3월 중간고사",
    subject: "수학",
    class: "A반",
    totalStudents: 12,
    gradedCount: 8,
    pendingCount: 4,
    dueDate: "2025-03-20",
    status: "진행중",
  },
  {
    id: 2,
    examTitle: "영어 쪽지시험 #1",
    subject: "영어",
    class: "B반",
    totalStudents: 15,
    gradedCount: 0,
    pendingCount: 15,
    dueDate: "2025-03-22",
    status: "대기",
  },
  {
    id: 3,
    examTitle: "과학 실험평가",
    subject: "과학",
    class: "A반",
    totalStudents: 12,
    gradedCount: 12,
    pendingCount: 0,
    dueDate: "2025-03-18",
    status: "완료",
  },
];

const mockGradedExams = [
  {
    id: 1,
    examTitle: "2월 기말고사",
    subject: "수학",
    class: "A반",
    completedDate: "2025-02-28",
    totalStudents: 12,
    avgScore: 82.5,
    highScore: 98,
    lowScore: 65,
  },
  {
    id: 2,
    examTitle: "영어 단어시험",
    subject: "영어",
    class: "B반",
    completedDate: "2025-02-25",
    totalStudents: 15,
    avgScore: 88.3,
    highScore: 100,
    lowScore: 72,
  },
];

function StatCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  className: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="mb-1 text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg",
            className
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function GradingManagementPage() {
  const [activeTab, setActiveTab] = useState("pending"); // "pending", "completed"

  const pendingTasks = mockGradingTasks.filter((task) => task.status !== "완료");

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="채점 관리"
        description="제출된 시험/과제 채점 현황을 확인하고 관리하세요."
      />

      {/* 통계 카드 */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="대기 중"
          value={mockGradingTasks.filter((t) => t.status === "대기").length}
          icon={Clock}
          className="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="진행 중"
          value={mockGradingTasks.filter((t) => t.status === "진행중").length}
          icon={CheckSquare}
          className="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="완료"
          value={mockGradingTasks.filter((t) => t.status === "완료").length}
          icon={CheckCircle2}
          className="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="미채점 답안"
          value={mockGradingTasks.reduce((sum, t) => sum + t.pendingCount, 0)}
          icon={FileText}
          className="bg-rose-50 text-rose-600"
        />
      </section>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            채점 대기 목록
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            채점 완료 목록
          </TabsTrigger>
        </TabsList>

        {/* 채점 대기 */}
        <TabsContent value="pending" className="space-y-3">
          {pendingTasks.length > 0 ? (
            pendingTasks.map((task) => (
              <Card key={task.id} className="transition-colors hover:bg-muted/40">
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {task.examTitle}
                        </p>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            task.status === "진행중"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-amber-50 text-amber-600"
                          )}
                        >
                          {task.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {task.subject} | {task.class} | 마감: {task.dueDate}
                      </p>
                    </div>
                    <Button size="sm">채점 시작</Button>
                  </div>

                  <div className="mb-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="mb-1 text-xs text-muted-foreground">
                        전체 학생
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {task.totalStudents}명
                      </p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <p className="mb-1 text-xs text-muted-foreground">
                        채점 완료
                      </p>
                      <p className="text-lg font-bold text-emerald-600">
                        {task.gradedCount}명
                      </p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3">
                      <p className="mb-1 text-xs text-muted-foreground">
                        채점 대기
                      </p>
                      <p className="text-lg font-bold text-amber-600">
                        {task.pendingCount}명
                      </p>
                    </div>
                  </div>

                  {task.status === "진행중" && (
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">진행률</span>
                        <span className="font-medium text-foreground">
                          {Math.round(
                            (task.gradedCount / task.totalStudents) * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${(task.gradedCount / task.totalStudents) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={Clock}
              title="대기 중인 채점이 없습니다"
              description="채점이 필요한 시험이 생기면 여기에 표시됩니다."
            />
          )}
        </TabsContent>

        {/* 채점 완료 */}
        <TabsContent value="completed" className="space-y-3">
          {mockGradedExams.length > 0 ? (
            mockGradedExams.map((exam) => (
              <Card key={exam.id} className="transition-colors hover:bg-muted/40">
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <p className="font-semibold text-foreground">
                          {exam.examTitle}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {exam.subject} | {exam.class} | 완료일:{" "}
                        {exam.completedDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <TrendingUp className="h-4 w-4" />
                        통계 보기
                      </Button>
                      <Button variant="outline" size="sm">
                        상세보기
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="mb-1 text-xs text-muted-foreground">
                        응시 인원
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {exam.totalStudents}명
                      </p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <p className="mb-1 text-xs text-muted-foreground">
                        평균 점수
                      </p>
                      <p className="text-lg font-bold text-emerald-600">
                        {exam.avgScore}점
                      </p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3">
                      <p className="mb-1 text-xs text-muted-foreground">
                        최고 점수
                      </p>
                      <p className="text-lg font-bold text-amber-600">
                        {exam.highScore}점
                      </p>
                    </div>
                    <div className="rounded-lg bg-rose-50 p-3">
                      <p className="mb-1 text-xs text-muted-foreground">
                        최저 점수
                      </p>
                      <p className="text-lg font-bold text-rose-600">
                        {exam.lowScore}점
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="채점 완료된 시험이 없습니다"
              description="채점이 끝난 시험이 여기에 표시됩니다."
            />
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
