"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  Users,
  Calendar,
  CheckCircle,
  Eye,
  GraduationCap,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { getLinkedAccounts, getMyClasses, setLinkClass, type LinkedAccount, type MentoringClass } from "@/lib/api/hub";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StudentManagementPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [linkedStudents, setLinkedStudents] = useState<LinkedAccount[]>([]);
  const [myClasses, setMyClasses] = useState<MentoringClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [impersonatingMap, setImpersonatingMap] = useState<Record<string, boolean>>({});
  const [selectedAppMap, setSelectedAppMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [links, classes] = await Promise.all([
          getLinkedAccounts(),
          getMyClasses(),
        ]);
        const students = (Array.isArray(links) ? links : []).filter(l => l.partnerType !== 'teacher');
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

  const handleImpersonate = async (studentId: string, sharedApps: string[]) => {
    if (!sharedApps || sharedApps.length === 0) return;

    // 선택된 앱이 없으면 첫 번째 공유 앱 사용
    const appId = selectedAppMap[studentId] || sharedApps[0];

    try {
      setImpersonatingMap(prev => ({ ...prev, [studentId]: true }));
      const { impersonateApp } = await import('@/lib/api/hub');
      const code = await impersonateApp(studentId, appId);

      const targetUrls: Record<string, string> = {
        'susi': process.env.NEXT_PUBLIC_SUSI_URL || 'https://susi-front.web.app',
        'jungsi': process.env.NEXT_PUBLIC_JUNGSI_URL || 'https://jungsi-front.web.app',
        'studyplanner': process.env.NEXT_PUBLIC_STUDYPLANNER_URL || 'https://studyplanner-front.web.app',
        'examhub': process.env.NEXT_PUBLIC_EXAMHUB_URL || 'https://examhub-front.web.app',
        'mysanggibu': process.env.NEXT_PUBLIC_MYSANGGIBU_URL || 'https://ms-front.web.app',
      };

      const baseUrl = targetUrls[appId] || targetUrls['susi'];
      const targetUrl = new URL('/main', baseUrl);
      targetUrl.searchParams.set('sso_code', code);

      window.open(targetUrl.toString(), '_blank');
    } catch (err) {
      console.error('Failed to impersonate:', err);
      alert('앱 대리 접속에 실패했습니다. 권한을 확인해주세요.');
    } finally {
      setImpersonatingMap(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const assignedCount = linkedStudents.filter(s => s.classId).length;
  const appLinkedCount = linkedStudents.filter(s => s.sharedApps?.length > 0).length;

  if (loading) {
    return (
      <PageContainer className="space-y-6">
        <PageHeader title="학생 관리" description="연동된 학생을 관리하고 학습 현황을 확인하세요" />
        <Spinner full label="불러오는 중..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="학생 관리" description="연동된 학생을 관리하고 학습 현황을 확인하세요" />

      {/* 상단: 통계 카드 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="전체 학생" value={linkedStudents.length} unit="명" icon={Users} />
        <StatCard label="반 배정" value={assignedCount} unit="명" icon={CheckCircle} />
        <StatCard label="앱 연동" value={appLinkedCount} unit="명" icon={BookOpen} />
      </div>

      {/* 검색 + 필터 */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="학생 이름으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="h-9 w-auto min-w-[140px] rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="all">전체 반</option>
          <option value="none">미배정</option>
          {myClasses.map(cls => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
      </div>

      {/* 학생 목록 */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <div key={student.linkId} className="rounded-xl border bg-card p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <GraduationCap className="h-[22px] w-[22px] text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="cursor-pointer truncate text-base font-semibold text-foreground"
                    onClick={() => goToDetail(student.partnerId)}
                  >
                    {student.partnerName}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(student.linkedAt).toLocaleDateString('ko-KR')}
                    </span>
                    {student.sharedApps?.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <CheckCircle className="h-3 w-3" />
                        앱 {student.sharedApps.length}개
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 공유 앱 수 표시 (뷰어에서 확인 가능) */}
              {student.sharedApps?.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                    <BookOpen className="h-3 w-3" />
                    연동 앱 {student.sharedApps.length}개
                  </span>
                </div>
              )}

              {/* 하단 액션 */}
              <div className="flex items-center gap-2 border-t pt-3">
                <select
                  value={student.classId || ''}
                  onChange={(e) => handleClassChange(student.linkId, e.target.value ? Number(e.target.value) : null)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-9 flex-1 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">반 미배정</option>
                  {myClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
                <Button variant="outline" size="sm" onClick={() => goToDetail(student.partnerId)}>
                  <Eye className="h-4 w-4" />
                  상세
                </Button>
              </div>

              {/* 앱 대리 접속 (Impersonation) UI */}
              {student.sharedApps?.length > 0 && (
                <div className="mt-3 flex items-center gap-2 border-t border-dashed pt-3">
                  <select
                    value={selectedAppMap[student.partnerId] || student.sharedApps[0] || ''}
                    onChange={(e) => setSelectedAppMap(prev => ({ ...prev, [student.partnerId]: e.target.value }))}
                    className="h-8 flex-1 rounded-md border border-input bg-transparent px-3 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {student.sharedApps.map(app => (
                      <option key={app} value={app}>{app.toUpperCase()} 앱</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={() => handleImpersonate(student.partnerId, student.sharedApps)}
                    disabled={impersonatingMap[student.partnerId]}
                  >
                    {impersonatingMap[student.partnerId] ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <BookOpen className="h-3.5 w-3.5" />
                    )}
                    {impersonatingMap[student.partnerId] ? "접속 중" : "앱 접속"}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title={searchTerm || selectedClass !== "all" ? "검색 결과가 없습니다" : "연동된 학생이 없습니다"}
          description={
            searchTerm || selectedClass !== "all"
              ? "다른 검색 조건을 시도해보세요"
              : "Hub에서 초대 링크를 생성하여 학생을 연동하세요"
          }
        />
      )}
    </PageContainer>
  );
}

function StatCard({ label, value, unit, icon: Icon }: { label: string; value: number; unit: string; icon: LucideIcon }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {value}
            <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>
          </p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-primary/10")}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
