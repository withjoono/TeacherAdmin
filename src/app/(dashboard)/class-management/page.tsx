"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  FileText,
  ClipboardList,
  Plus,
  Eye,
  TrendingUp,
} from "lucide-react";

// Mock 데이터
const mockClasses = [
  { id: "class-a", name: "A반", studentCount: 12 },
  { id: "class-b", name: "B반", studentCount: 15 },
  { id: "class-c", name: "C반", studentCount: 11 },
  { id: "class-d", name: "D반", studentCount: 10 },
];

const mockStudents = {
  "class-a": [
    { id: 1, name: "김철수", number: 1, avgScore: 85.5, attendance: 95 },
    { id: 2, name: "이영희", number: 2, avgScore: 92.3, attendance: 98 },
    { id: 3, name: "박민수", number: 3, avgScore: 78.2, attendance: 90 },
  ],
  "class-b": [
    { id: 4, name: "정수진", number: 1, avgScore: 88.4, attendance: 97 },
    { id: 5, name: "최동현", number: 2, avgScore: 81.7, attendance: 93 },
  ],
  "class-c": [
    { id: 6, name: "한지원", number: 1, avgScore: 90.1, attendance: 96 },
  ],
  "class-d": [
    { id: 7, name: "강민재", number: 1, avgScore: 86.3, attendance: 94 },
  ],
};

const mockExams = [
  {
    id: 1,
    name: "중간고사",
    subject: "수학",
    date: "2025-03-15",
    avgScore: 82.5,
    submissionRate: 95,
  },
  {
    id: 2,
    name: "쪽지시험",
    subject: "영어",
    date: "2025-03-10",
    avgScore: 88.3,
    submissionRate: 100,
  },
];

const mockAssignments = [
  {
    id: 1,
    name: "숙제 1번",
    subject: "국어",
    dueDate: "2025-03-20",
    submissionRate: 87,
    status: "진행중",
  },
  {
    id: 2,
    name: "프로젝트",
    subject: "과학",
    dueDate: "2025-03-25",
    submissionRate: 60,
    status: "진행중",
  },
];

export default function ClassManagementPage() {
  const [selectedClass, setSelectedClass] = useState(mockClasses[0].id);

  const currentStudents = mockStudents[selectedClass as keyof typeof mockStudents] || [];

  return (
    <div className="flex flex-col">
      <Header title="클래스 관리" />

      <div className="flex-1 p-6 space-y-6">
        {/* 반 선택 탭 */}
        <Card>
          <CardHeader>
            <CardTitle>반 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {mockClasses.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    cls.id === selectedClass
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {cls.name}
                  <span className="ml-2 text-sm opacity-80">
                    ({cls.studentCount}명)
                  </span>
                </button>
              ))}
              <button className="px-6 py-3 rounded-lg font-semibold border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:text-primary transition-colors">
                <Plus className="w-5 h-5 inline mr-2" />
                반 추가
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 관리 탭 */}
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students">
              <Users className="w-4 h-4 mr-2" />
              반별 학생명
            </TabsTrigger>
            <TabsTrigger value="exams">
              <FileText className="w-4 h-4 mr-2" />
              시험 현황
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <ClipboardList className="w-4 h-4 mr-2" />
              과제 현황
            </TabsTrigger>
          </TabsList>

          {/* 학생 목록 */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>학생 목록</CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    학생 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                          {student.number}
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            평균: {student.avgScore}점 | 출석률: {student.attendance}%
                          </p>
                        </div>
                      </div>
                      <Link href={`/student-management/${student.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          상세보기
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 시험 현황 */}
          <TabsContent value="exams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>반 학생 전체 시험 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{exam.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {exam.subject} | {exam.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">
                          평균: {exam.avgScore}점
                        </p>
                        <p className="text-sm text-muted-foreground">
                          제출률: {exam.submissionRate}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 과제 현황 */}
          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>반 학생 전체 과제 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{assignment.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.subject} | 마감: {assignment.dueDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            assignment.submissionRate >= 80
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {assignment.submissionRate}% 제출
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {assignment.status}
                        </p>
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




























