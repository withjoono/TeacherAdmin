"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
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
  UserCircle,
  Filter,
} from "lucide-react";
import { getLinkedAccounts, getMyClasses, setLinkClass, type LinkedAccount, type MentoringClass } from "@/lib/api/hub";
import { APP_LABELS, openStudentApp } from "@/lib/app-viewer";

const avatarGradients = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-orange-500 to-rose-600",
  "from-cyan-500 to-blue-600",
  "from-pink-500 to-fuchsia-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

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
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">학생 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header title="학생 관리" />

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ─── Header + Search Bar ─── */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">연동 학생</h1>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {linkedStudents.length}명
                </span>
              </div>
            </div>

            {/* Search + Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="학생 이름으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl h-11"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="h-11 pl-9 pr-4 rounded-xl border border-input bg-background text-sm appearance-none cursor-pointer min-w-[140px]"
                >
                  <option value="all">전체 반</option>
                  <option value="none">미배정</option>
                  {myClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ─── Student Card Grid ─── */}
          {filteredStudents.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((student, idx) => {
                const grad = avatarGradients[idx % avatarGradients.length];
                return (
                  <div
                    key={student.linkId}
                    className="group rounded-2xl border bg-card p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Student Info */}
                    <div className="flex items-start gap-3.5 mb-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white text-lg font-bold shadow-sm shrink-0 cursor-pointer group-hover:scale-105 transition-transform`}
                        onClick={() => goToDetail(student.partnerId)}
                      >
                        {student.partnerName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-base truncate cursor-pointer hover:text-primary transition-colors"
                          onClick={() => goToDetail(student.partnerId)}
                        >
                          {student.partnerName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(student.linkedAt).toLocaleDateString('ko-KR')}
                          </span>
                          {student.sharedApps?.length > 0 && (
                            <span className="flex items-center gap-1 text-xs text-blue-600">
                              <CheckCircle className="w-3 h-3" />
                              앱 {student.sharedApps.length}개
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Shared Apps */}
                    {student.sharedApps?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {student.sharedApps.map(appKey => {
                          const label = APP_LABELS[appKey];
                          return (
                            <button
                              key={appKey}
                              onClick={(e) => {
                                e.stopPropagation();
                                openStudentApp(appKey, student.partnerId);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 hover:shadow-sm transition-all border border-blue-100"
                              title={`${label?.name || appKey} 열기`}
                            >
                              <span>{label?.emoji || '📱'}</span>
                              <span>{label?.name || appKey}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Actions: Class assign + Detail */}
                    <div className="flex items-center gap-2 pt-3 border-t">
                      <select
                        value={student.classId || ''}
                        onChange={(e) => handleClassChange(student.linkId, e.target.value ? Number(e.target.value) : null)}
                        className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="">반 미배정</option>
                        {myClasses.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg shrink-0"
                        onClick={() => goToDetail(student.partnerId)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        상세
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/30 py-16">
              <UserCircle className="w-14 h-14 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-1">
                {searchTerm || selectedClass !== "all" ? "검색 결과가 없습니다" : "연동된 학생이 없습니다"}
              </h3>
              <p className="text-sm text-muted-foreground text-center px-8">
                {searchTerm || selectedClass !== "all"
                  ? "다른 검색 조건을 시도해보세요"
                  : "Hub에서 초대 링크를 생성하여 학생을 연동하세요"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
