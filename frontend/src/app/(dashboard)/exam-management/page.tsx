"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Plus,
  Upload,
  CheckCircle2,
  Clock,
  BarChart3,
  Download,
} from "lucide-react";

// Mock 데이터
const mockExams = [
  {
    id: 1,
    title: "3월 중간고사",
    subject: "수학",
    class: "A반",
    date: "2025-03-15",
    totalQuestions: 20,
    totalScore: 100,
    submissionCount: 12,
    totalStudents: 12,
    avgScore: 82.5,
    status: "채점완료",
  },
  {
    id: 2,
    title: "영어 쪽지시험 #1",
    subject: "영어",
    class: "B반",
    date: "2025-03-18",
    totalQuestions: 10,
    totalScore: 50,
    submissionCount: 10,
    totalStudents: 15,
    avgScore: null,
    status: "진행중",
  },
  {
    id: 3,
    title: "과학 실험평가",
    subject: "과학",
    class: "A반",
    date: "2025-03-25",
    totalQuestions: 15,
    totalScore: 75,
    submissionCount: 0,
    totalStudents: 12,
    avgScore: null,
    status: "예정",
  },
];

const mockQuestionSets = [
  {
    id: 1,
    title: "수학 1학년 1학기 중간고사",
    subject: "수학",
    questionCount: 25,
    createdDate: "2025-03-01",
    usageCount: 3,
  },
  {
    id: 2,
    title: "영어 단어시험 Unit 1-3",
    subject: "영어",
    questionCount: 30,
    createdDate: "2025-02-28",
    usageCount: 5,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "채점완료":
      return "bg-green-100 text-green-700";
    case "진행중":
      return "bg-blue-100 text-blue-700";
    case "예정":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "채점완료":
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    case "진행중":
      return <Clock className="w-5 h-5 text-blue-600" />;
    case "예정":
      return <FileText className="w-5 h-5 text-gray-600" />;
    default:
      return null;
  }
};

export default function ExamManagementPage() {
  return (
    <div className="flex flex-col">
      <Header title="시험 관리" />

      <div className="flex-1 p-6 space-y-6">
        {/* 빠른 작업 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <Plus className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">새 시험 생성</h3>
                <p className="text-sm text-muted-foreground">
                  시험을 만들고 학생에게 배포
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                  <Upload className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-1">문제 업로드</h3>
                <p className="text-sm text-muted-foreground">
                  Excel/CSV로 문제 등록
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">채점 시작</h3>
                <p className="text-sm text-muted-foreground">
                  제출된 답안 채점하기
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 관리 탭 */}
        <Tabs defaultValue="exams" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="exams">
              <FileText className="w-4 h-4 mr-2" />
              시험 목록
            </TabsTrigger>
            <TabsTrigger value="questions">
              <Upload className="w-4 h-4 mr-2" />
              문제 관리
            </TabsTrigger>
          </TabsList>

          {/* 시험 목록 */}
          <TabsContent value="exams" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>전체 시험 ({mockExams.length})</CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    새 시험 생성
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(exam.status)}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{exam.title}</p>
                              <span
                                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(exam.status)}`}
                              >
                                {exam.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {exam.subject} | {exam.class} | {exam.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {exam.status === "채점완료" && (
                            <Button variant="outline" size="sm">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              통계
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            상세보기
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            문항 수
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            {exam.totalQuestions}문항
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            배점
                          </p>
                          <p className="text-lg font-bold text-purple-600">
                            {exam.totalScore}점
                          </p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            제출현황
                          </p>
                          <p className="text-lg font-bold text-orange-600">
                            {exam.submissionCount}/{exam.totalStudents}
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            평균점수
                          </p>
                          <p className="text-lg font-bold text-green-600">
                            {exam.avgScore ? `${exam.avgScore}점` : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 문제 관리 */}
          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>문제 세트</CardTitle>
                  <Button size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    문제 업로드
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockQuestionSets.map((set) => (
                    <div
                      key={set.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{set.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {set.subject} | {set.questionCount}문항 | 생성일:{" "}
                          {set.createdDate}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          사용 횟수: {set.usageCount}회
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          다운로드
                        </Button>
                        <Button variant="outline" size="sm">
                          수정
                        </Button>
                        <Button size="sm">시험 생성</Button>
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




























