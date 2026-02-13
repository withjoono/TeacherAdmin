"use client";

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { getMyClasses, getClassStudents, getTestResults, getAssignmentSubmissions } from "@/lib/api/teacher";
import type { ClassInfo, StudentInfo } from "@/lib/api/teacher";

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // 반 목록 로드
  useEffect(() => {
    async function fetchClasses() {
      try {
        setLoading(true);
        const data = await getMyClasses();
        setClasses(data || []);
        if (data && data.length > 0) {
          setSelectedClass(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch classes:', err);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  // 선택된 반의 학생 로드
  useEffect(() => {
    if (!selectedClass) return;
    async function fetchStudents() {
      try {
        setStudentsLoading(true);
        const data = await getClassStudents(selectedClass);
        setStudents(data || []);
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    }
    fetchStudents();
  }, [selectedClass]);

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="클래스 관리" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

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
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${cls.id === selectedClass
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted hover:bg-muted/80"
                    }`}
                >
                  {cls.name}
                  <span className="ml-2 text-sm opacity-80">
                    ({cls.studentCount || 0}명)
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
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : students.length > 0 ? (
                  <div className="space-y-2">
                    {students.map((student, idx) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                            {student.number || idx + 1}
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.avgScore ? `평균: ${student.avgScore}점 | ` : ''}
                              {student.attendance ? `출석률: ${student.attendance}%` : ''}
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
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    등록된 학생이 없습니다
                  </div>
                )}
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
                <div className="text-center text-sm text-muted-foreground py-8">
                  수업 계획에서 시험을 생성하면 여기에 표시됩니다
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
                <div className="text-center text-sm text-muted-foreground py-8">
                  수업 계획에서 과제를 생성하면 여기에 표시됩니다
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
