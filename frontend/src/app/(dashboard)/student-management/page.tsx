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
  TrendingUp,
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
      <div className="flex flex-col min-h-[80vh]">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">학생 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* ─── Hero Banner ─── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-gradient-to-r from-indigo-400/20 to-transparent rounded-full blur-3xl rotate-12" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">학생 관리</h1>
                <p className="text-blue-100/80 text-sm mt-0.5">연동된 학생을 관리하고 학습 현황을 확인하세요</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-200" />
                <span className="text-xs text-blue-200 font-medium">전체 학생</span>
              </div>
              <p className="text-2xl font-bold text-white">{linkedStudents.length}<span className="text-sm font-normal text-blue-200 ml-1">명</span></p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-300" />
                <span className="text-xs text-blue-200 font-medium">반 배정</span>
              </div>
              <p className="text-2xl font-bold text-white">{assignedCount}<span className="text-sm font-normal text-blue-200 ml-1">명</span></p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span className="text-xs text-blue-200 font-medium">앱 연동</span>
              </div>
              <p className="text-2xl font-bold text-white">{appLinkedCount}<span className="text-sm font-normal text-blue-200 ml-1">명</span></p>
            </div>
          </div>

          {/* Search + Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                placeholder="학생 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/40"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-11 pl-9 pr-4 rounded-xl border border-white/20 bg-white/10 text-white text-sm appearance-none cursor-pointer min-w-[140px] focus:outline-none focus:bg-white/15"
              >
                <option value="all" className="text-gray-900">전체 반</option>
                <option value="none" className="text-gray-900">미배정</option>
                {myClasses.map(cls => (
                  <option key={cls.id} value={cls.id} className="text-gray-900">{cls.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Student Card Grid ─── */}
      <div className="flex-1 p-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          {filteredStudents.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((student, idx) => {
                const grad = avatarGradients[idx % avatarGradients.length];
                return (
                  <div
                    key={student.linkId}
                    className="group rounded-2xl border bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Student Info */}
                    <div className="flex items-start gap-3.5 mb-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white text-lg font-bold shadow-md shadow-black/10 shrink-0 cursor-pointer group-hover:scale-110 transition-transform duration-300`}
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
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
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
                        className="rounded-lg shrink-0 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
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
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white py-20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
                <UserCircle className="w-8 h-8 text-blue-400" />
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
