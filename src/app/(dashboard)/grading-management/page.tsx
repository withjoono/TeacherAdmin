"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  FileText,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";

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

const getStatusColor = (status: string) => {
  switch (status) {
    case "완료":
      return "bg-green-100 text-green-700";
    case "진행중":
      return "bg-blue-100 text-blue-700";
    case "대기":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function GradingManagementPage() {
  return (
    <div className="flex flex-col">
      <Header title="채점 관리" />

      <div className="flex-1 p-6 space-y-6">
        {/* 통계 카드 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">대기 중</p>
                  <h3 className="text-2xl font-bold text-orange-600">
                    {mockGradingTasks.filter((t) => t.status === "대기").length}
                  </h3>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">진행 중</p>
                  <h3 className="text-2xl font-bold text-blue-600">
                    {mockGradingTasks.filter((t) => t.status === "진행중").length}
                  </h3>
                </div>
                <CheckSquare className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">완료</p>
                  <h3 className="text-2xl font-bold text-green-600">
                    {mockGradingTasks.filter((t) => t.status === "완료").length}
                  </h3>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">미채점 답안</p>
                  <h3 className="text-2xl font-bold text-red-600">
                    {mockGradingTasks.reduce((sum, t) => sum + t.pendingCount, 0)}
                  </h3>
                </div>
                <FileText className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 관리 탭 */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              <Clock className="w-4 h-4 mr-2" />
              채점 대기 목록
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              채점 완료 목록
            </TabsTrigger>
          </TabsList>

          {/* 채점 대기 목록 */}
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>채점이 필요한 시험</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockGradingTasks
                    .filter((task) => task.status !== "완료")
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{task.examTitle}</p>
                              <span
                                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}
                              >
                                {task.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {task.subject} | {task.class} | 마감: {task.dueDate}
                            </p>
                          </div>
                          <Button>채점 시작</Button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">
                              전체 학생
                            </p>
                            <p className="text-lg font-bold text-blue-600">
                              {task.totalStudents}명
                            </p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">
                              채점 완료
                            </p>
                            <p className="text-lg font-bold text-green-600">
                              {task.gradedCount}명
                            </p>
                          </div>
                          <div className="p-3 bg-orange-50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">
                              채점 대기
                            </p>
                            <p className="text-lg font-bold text-orange-600">
                              {task.pendingCount}명
                            </p>
                          </div>
                        </div>

                        {task.status === "진행중" && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>진행률</span>
                              <span className="font-medium">
                                {Math.round((task.gradedCount / task.totalStudents) * 100)}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all"
                                style={{
                                  width: `${(task.gradedCount / task.totalStudents) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 채점 완료 목록 */}
          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>채점 완료된 시험</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockGradedExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <p className="font-medium">{exam.examTitle}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {exam.subject} | {exam.class} | 완료일: {exam.completedDate}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            통계 보기
                          </Button>
                          <Button variant="outline" size="sm">
                            상세보기
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            응시 인원
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            {exam.totalStudents}명
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            평균 점수
                          </p>
                          <p className="text-lg font-bold text-green-600">
                            {exam.avgScore}점
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            최고 점수
                          </p>
                          <p className="text-lg font-bold text-purple-600">
                            {exam.highScore}점
                          </p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            최저 점수
                          </p>
                          <p className="text-lg font-bold text-orange-600">
                            {exam.lowScore}점
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}




























