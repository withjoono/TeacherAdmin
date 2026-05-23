"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MessageSquare,
  Home,
  Users,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { getMyClasses, getClassStudents } from "@/lib/api/teacher";
import type { ClassInfo, StudentInfo } from "@/lib/api/teacher";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ParentInfo {
  id: string;
  name: string;
  studentName: string;
  className: string;
  phone: string;
  email: string;
}

export default function ParentManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [parents, setParents] = useState<ParentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchParentInfo() {
      try {
        setLoading(true);
        const classes = await getMyClasses();
        const parentPromises = (classes || []).map(async (cls: ClassInfo) => {
          const students = await getClassStudents(cls.id);
          return (students || []).map((s: StudentInfo) => ({
            id: `parent-${s.id}`,
            name: `${s.name} 학부모`,
            studentName: s.name,
            className: cls.name,
            phone: '',
            email: '',
          }));
        });
        const results = await Promise.all(parentPromises);
        setParents(results.flat());
      } catch (err) {
        console.error('Failed to fetch parent info:', err);
        setParents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchParentInfo();
  }, []);

  const filteredParents = parents.filter(
    (parent) =>
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const classCount = new Set(parents.map(p => p.className)).size;

  if (loading) {
    return (
      <PageContainer className="space-y-6">
        <PageHeader title="학부모 관리" description="학부모 연락처와 소통 현황을 확인하세요" />
        <Spinner full label="불러오는 중..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="학부모 관리"
        description="학부모 연락처와 소통 현황을 확인하세요"
        actions={
          <Button>
            <MessageSquare className="h-4 w-4" />
            일괄 메시지 발송
          </Button>
        }
      />

      {/* 상단: 통계 카드 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="전체 학부모" value={parents.length} unit="명" icon={Users} />
        <StatCard label="담당 학생" value={parents.length} unit="명" icon={UserRound} />
        <StatCard label="소속 반" value={classCount} unit="개" icon={Home} />
      </div>

      {/* 검색 */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="학부모명 또는 학생명으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 학부모 카드 그리드 */}
      {filteredParents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredParents.map((parent) => (
            <div key={parent.id} className="rounded-xl border bg-card p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-semibold text-foreground">
                    {parent.name}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      <UserRound className="h-3 w-3" />
                      {parent.studentName}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {parent.className}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <Button variant="outline" size="sm" className="w-full">
                  <MessageSquare className="h-4 w-4" />
                  쪽지 보내기
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Home}
          title={searchTerm ? "검색 결과가 없습니다" : "등록된 학부모가 없습니다"}
          description={
            searchTerm
              ? "다른 검색어를 시도해보세요"
              : "학생이 등록되면 학부모 정보가 자동으로 표시됩니다"
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
