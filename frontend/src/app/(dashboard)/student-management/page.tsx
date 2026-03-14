"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ExternalLink,
  TrendingUp,
  Loader2,
  Users,
  Calendar,
  CheckCircle,
  FolderOpen,
} from "lucide-react";
import { getLinkedAccounts, getMyClasses, setLinkClass, type LinkedAccount, type MentoringClass } from "@/lib/api/hub";

const APP_LABELS: Record<string, string> = {
  studyplanner: '📅 StudyPlanner',
  examhub: '📝 ExamHub',
  mysanggibu: '📋 내생기부',
  jungsi: '🎯 정시계산기',
  susi: '📂 수시플래너',
};

export default function StudentManagementPage() {
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

  // 반별/검색 필터링
  const filteredStudents = useMemo(() => {
    return linkedStudents.filter((student) => {
      const matchName = student.partnerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = selectedClass === "all" || 
        (selectedClass === "none" ? !student.classId : student.classId === Number(selectedClass));
      return matchName && matchClass;
    });
  }, [linkedStudents, searchTerm, selectedClass]);

  // 반 배정 변경
  const handleClassChange = async (linkId: number, classId: number | null) => {
    try {
      await setLinkClass(linkId, classId);
      // 로컬 상태 업데이트
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
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{student.partnerName}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
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
                        {/* 공유 앱 목록 */}
                        {student.sharedApps?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {student.sharedApps.map(appKey => (
                              <span key={appKey} className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                {APP_LABELS[appKey] || appKey}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* 반 배정 드롭다운 */}
                      <select
                        value={student.classId || ''}
                        onChange={(e) => handleClassChange(student.linkId, e.target.value ? Number(e.target.value) : null)}
                        className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                      >
                        <option value="">반 미배정</option>
                        {myClasses.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
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
                {searchTerm || selectedClass !== "all" ? '검색 결과가 없습니다' : '연동된 학생이 없습니다. Hub에서 초대 링크를 생성하세요.'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
