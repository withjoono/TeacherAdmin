"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ExternalLink,
  Loader2,
  Users,
  Calendar,
  CheckCircle,
  Eye,
} from "lucide-react";
import { getLinkedAccounts, getMyClasses, setLinkClass, type LinkedAccount, type MentoringClass } from "@/lib/api/hub";
import { APP_LABELS, openStudentApp } from "@/lib/app-viewer";

export default function StudentManagementPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [linkedStudents, setLinkedStudents] = useState<LinkedAccount[]>([]);
  const [myClasses, setMyClasses] = useState<MentoringClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("all");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [links, classes] = await Promise.all([
          getLinkedAccounts(),
          getMyClasses(),
        ]);
        const students = (Array.isArray(links) ? links : []).filter(l => l.partnerType === 'student');
        setLinkedStudents(students);
        setMyClasses(Array.isArray(classes) ? classes : []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setLinkedStudents([]);
        setMyClasses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredStudents = useMemo(() => {
    return linkedStudents.filter((student) => {
      const matchName = student.partnerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = selectedClass === "all" || 
        (selectedClass === "none" ? !student.classId : student.classId === Number(selectedClass));
      return matchName && matchClass;
    });
  }, [linkedStudents, searchTerm, selectedClass]);

  const handleClassChange = async (linkId: number, classId: number | null) => {
    try {
      await setLinkClass(linkId, classId);
      setLinkedStudents(prev => prev.map(s => {
        if (s.linkId === linkId) {
          const cls = myClasses.find(c => c.id === classId);
          return { ...s, classId, className: cls?.name || null };
        }
        return s;
      }));
    } catch (err) {
      console.error('Failed to change class:', err);
    }
  };

  const goToDetail = (studentId: string) => {
    router.push(`/student-management/detail?id=${studentId}`);
  };

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
        {/* 검색 & 필터 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="md:col-span-2">
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
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">전체 반</option>
                <option value="none">미배정</option>
                {myClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{linkedStudents.length}</p>
                <p className="text-sm text-muted-foreground">연동 학생 수</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 학생 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>연동된 학생 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStudents.length > 0 ? (
              <div className="space-y-3">
                {filteredStudents.map((student) => (
                  <div
                    key={student.linkId}
                    className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* 학생 정보 (클릭 가능) */}
                      <div
                        className="flex items-center gap-4 cursor-pointer group flex-1 min-w-0"
                        onClick={() => goToDetail(student.partnerId)}
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                          {student.partnerName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium group-hover:text-primary transition-colors">
                            {student.partnerName}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(student.linkedAt).toLocaleDateString('ko-KR')}
                            </span>
                            {student.sharedApps?.length > 0 && (
                              <span className="flex items-center gap-1 text-blue-500">
                                <CheckCircle className="w-3 h-3" />
                                앱 {student.sharedApps.length}개 공유
                              </span>
                            )}
                          </div>
                          {/* 공유 앱 버튼들 */}
                          {student.sharedApps?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {student.sharedApps.map(appKey => {
                                const label = APP_LABELS[appKey];
                                return (
                                  <button
                                    key={appKey}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openStudentApp(appKey, student.partnerId);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 hover:shadow-sm transition-all cursor-pointer border border-blue-200/50"
                                    title={`${label?.name || appKey} 열기 (학생 시점)`}
                                  >
                                    <span>{label?.emoji || '📱'}</span>
                                    <span>{label?.name || appKey}</span>
                                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 반 배정 + 상세보기 */}
                      <div className="flex items-center gap-2 shrink-0 sm:ml-4 ml-16">
                        <select
                          value={student.classId || ''}
                          onChange={(e) => handleClassChange(student.linkId, e.target.value ? Number(e.target.value) : null)}
                          className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">반 미배정</option>
                          {myClasses.map(cls => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          onClick={() => goToDetail(student.partnerId)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          상세보기
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                {searchTerm || selectedClass !== "all" ? '검색 결과가 없습니다' : '연동된 학생이 없습니다. Hub에서 초대 링크를 생성하세요.'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
