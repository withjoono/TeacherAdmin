"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MessageSquare,
  ExternalLink,
  Calendar,
  TrendingUp,
  ClipboardCheck,
  Loader2,
} from "lucide-react";
import { getMyClasses, getClassStudents, getPrivateComments } from "@/lib/api/teacher";
import type { ClassInfo, StudentInfo, PrivateComment } from "@/lib/api/teacher";

// ================================
// 학생 관리 페이지
// ================================
export default function StudentManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<Array<StudentInfo & { className: string }>>([]);
  const [messages, setMessages] = useState<PrivateComment[]>([]);
  const [loading, setLoading] = useState(true);

  // 모든 반의 학생 로드
  useEffect(() => {
    async function fetchAllStudents() {
      try {
        setLoading(true);
        const classes = await getMyClasses();
        const studentPromises = (classes || []).map(async (cls: ClassInfo) => {
          const students = await getClassStudents(cls.id);
          return (students || []).map((s: StudentInfo) => ({
            ...s,
            className: cls.name,
          }));
        });
        const results = await Promise.all(studentPromises);
        setAllStudents(results.flat());
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setAllStudents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAllStudents();
  }, []);

  const filteredStudents = allStudents.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="학생 관리" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header title="학생 관리" />

      <div className="flex-1 p-6 space-y-6">
        {/* 검색 및 통계 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="md:col-span-3">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="학생 이름으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{allStudents.length}</p>
                <p className="text-sm text-muted-foreground">전체 학생 수</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 관리 탭 */}
        <Tabs defaultValue="access" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="access">
              <ExternalLink className="w-4 h-4 mr-2" />
              학생 페이지 접근
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              쪽지
            </TabsTrigger>
          </TabsList>

          {/* 학생 페이지 접근 */}
          <TabsContent value="access" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>학생 목록 (플래너 검사 가능)</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredStudents.length > 0 ? (
                  <div className="space-y-3">
                    {filteredStudents.map((student, idx) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-xs">
                            {student.className}
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              {student.avgScore && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  평균: {student.avgScore}점
                                </span>
                              )}
                              {student.attendance && (
                                <span className="flex items-center gap-1">
                                  <ClipboardCheck className="w-3 h-3" />
                                  출석률: {student.attendance}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            플래너 검사
                          </Button>
                          <Button size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            페이지 접근
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    {searchTerm ? '검색 결과가 없습니다' : '등록된 학생이 없습니다'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 쪽지 */}
          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>쪽지함</CardTitle>
                  <Button size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    새 쪽지 보내기
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center text-sm text-muted-foreground py-8">
                  학생을 선택하면 쪽지 내역이 표시됩니다
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
