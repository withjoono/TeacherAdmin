"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  GraduationCap,
  BookOpen,
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

  const assignedCount = linkedStudents.filter(s => s.classId).length;
  const appLinkedCount = linkedStudents.filter(s => s.sharedApps?.length > 0).length;

  if (loading) {
    return (
      <div className="flex flex-col min-h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm text-muted-foreground">학생 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── Compact Header ─── */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">학생 관리</h1>
                <p className="text-xs text-muted-foreground mt-0.5">연동된 학생을 관리하고 학습 현황을 확인하세요</p>
              </div>
            </div>
            {/* Inline Stats */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <Users className="w-3.5 h-3.5" /> 전체 {linkedStudents.length}명
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle className="w-3.5 h-3.5" /> 배정 {assignedCount}명
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                <BookOpen className="w-3.5 h-3.5" /> 앱 {appLinkedCount}
              </span>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="학생 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-lg h-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-10 pl-9 pr-4 rounded-lg border border-input bg-background text-sm appearance-none cursor-pointer min-w-[140px]"
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
      </div>

      {/* ─── Student Card Grid ─── */}
      <div className="flex-1 p-6 bg-gray-50/60">
        <div className="max-w-7xl mx-auto">
          {filteredStudents.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((student, idx) => {
                const grad = avatarGradients[idx % avatarGradients.length];
                return (
                  <div
                    key={student.linkId}
                    className="group rounded-2xl border bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Student Info */}
                    <div className="flex items-start gap-3.5 mb-4">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white text-lg font-bold shadow-sm shrink-0 cursor-pointer group-hover:scale-105 transition-transform`}
                        onClick={() => goToDetail(student.partnerId)}
                      >
                        {student.partnerName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-sm truncate cursor-pointer hover:text-blue-600 transition-colors"
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
                              className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 hover:bg-blue-100 transition-all border border-blue-100"
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

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <select
                        value={student.classId || ''}
                        onChange={(e) => handleClassChange(student.linkId, e.target.value ? Number(e.target.value) : null)}
                        className="flex-1 h-8 rounded-md border border-input bg-background px-2.5 text-sm"
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
                        className="rounded-md shrink-0 h-8 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                        onClick={() => goToDetail(student.partnerId)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        상세
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white py-20">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <UserCircle className="w-7 h-7 text-blue-400" />
              </div>
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
