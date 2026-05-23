"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Loader2,
  UserPlus,
  BarChart3,
  Copy,
  CheckCircle2,
  GraduationCap,
  Hash,
  Crown,
  User,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { getMyArenaClasses, createArenaClass, getClassMembers } from "@/lib/api/classes";
import type { ArenaClass, ClassMember } from "@/lib/api/classes";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<ArenaClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassDesc, setNewClassDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClasses() {
      try {
        setLoading(true);
        const data = await getMyArenaClasses();
        setClasses(data || []);
        if (data && data.length > 0) {
          setSelectedClass(data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    async function fetchMembers() {
      try {
        setMembersLoading(true);
        const data = await getClassMembers(selectedClass!);
        setMembers(data || []);
      } catch (err) {
        console.error("Failed to fetch members:", err);
        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    }
    fetchMembers();
  }, [selectedClass]);

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return;
    try {
      setCreating(true);
      const newClass = await createArenaClass({
        name: newClassName.trim(),
        description: newClassDesc.trim() || undefined,
      });
      setClasses((prev) => [newClass, ...prev]);
      setSelectedClass(newClass.id);
      setNewClassName("");
      setNewClassDesc("");
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create class:", err);
      alert("클래스 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const selectedArena = classes.find((c) => c.id === selectedClass);
  const totalMembers = classes.reduce((sum, c) => sum + (c.memberCount || 0), 0);

  if (loading) {
    return (
      <PageContainer className="space-y-6">
        <Spinner full label="불러오는 중..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="클래스 관리"
        description={
          classes.length > 0
            ? `${classes.length}개의 클래스를 관리하고 있습니다`
            : "새로운 클래스를 만들어 학생을 관리하세요"
        }
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            클래스 생성
          </Button>
        }
      />

      {/* 상단: 통계 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="전체 클래스" value={classes.length} unit="개" icon={Layers} />
        <StatCard label="전체 멤버" value={totalMembers} unit="명" icon={Users} />
        <StatCard
          label="평균 인원"
          value={classes.length > 0 ? Math.round(totalMembers / classes.length) : 0}
          unit="명"
          icon={GraduationCap}
        />
      </div>

      {/* 클래스 카드 그리드 */}
      {classes.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">내 클래스</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => {
              const isSelected = cls.id === selectedClass;
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={cn(
                    "rounded-xl border bg-card p-4 text-left shadow-sm transition-colors",
                    isSelected ? "border-primary bg-accent" : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent">
                      <span className="text-lg font-bold text-primary">
                        {cls.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-semibold text-foreground">
                        {cls.name}
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {cls.memberCount || 0}명
                        </span>
                        <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          <Hash className="h-3 w-3" />
                          {cls.inviteCode}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title="아직 클래스가 없습니다"
          description="클래스를 생성하고 학생들을 초대해보세요"
          action={
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              첫 클래스 만들기
            </Button>
          }
        />
      )}

      {/* 선택된 클래스 상세 */}
      {selectedArena && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: 정보 */}
          <div className="space-y-4 lg:col-span-1">
            {/* 초대 코드 */}
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">초대 코드</p>
                <div className="mt-2 flex items-center gap-3">
                  <code className="font-mono text-2xl font-bold tracking-widest text-primary">
                    {selectedArena.inviteCode}
                  </code>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => copyInviteCode(selectedArena.inviteCode)}
                  >
                    {copiedCode === selectedArena.inviteCode ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  학생에게 이 코드를 공유하세요
                </p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Link href={`/class-management/students?id=${selectedArena.id}`}>
              <Card className="transition-colors hover:bg-muted">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      학생 임포트
                    </div>
                    <div className="text-xs text-muted-foreground">
                      학생 ID로 일괄 등록
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/class-management/stats?id=${selectedArena.id}`}>
              <Card className="transition-colors hover:bg-muted">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      학습 통계
                    </div>
                    <div className="text-xs text-muted-foreground">
                      일간/주간 학습량 분석
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Right: 멤버 목록 */}
          <Card className="overflow-hidden lg:col-span-2">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div className="flex items-center gap-2">
                <Users className="h-[18px] w-[18px] text-primary" />
                <span className="text-base font-semibold text-foreground">
                  멤버 목록
                </span>
                {members.length > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-primary">
                    {members.length}명
                  </span>
                )}
              </div>
              <Link href={`/class-management/students?id=${selectedClass}`}>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4" />
                  학생 추가
                </Button>
              </Link>
            </div>

            <div className="p-3">
              {membersLoading ? (
                <Spinner />
              ) : members.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2 text-left font-medium">#</th>
                      <th className="px-3 py-2 text-left font-medium">이름</th>
                      <th className="px-3 py-2 text-left font-medium">아이디</th>
                      <th className="px-3 py-2 text-right font-medium">역할</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, idx) => (
                      <tr key={member.memberId} className="border-t">
                        <td className="px-3 py-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">
                              {member.nickname?.charAt(0) || "?"}
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {member.nickname}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">
                          {member.authMemberId || member.email || "—"}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                              member.role === "owner"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-accent text-primary"
                            )}
                          >
                            {member.role === "owner" ? (
                              <>
                                <Crown className="h-3 w-3" /> 관리자
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3" /> 학생
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState
                  icon={Users}
                  title="등록된 멤버가 없습니다"
                  description='"학생 추가" 버튼으로 학생을 등록하세요'
                />
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ─── 클래스 생성 모달 ─── */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 클래스 생성</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label>
                클래스 이름 <span className="text-destructive">*</span>
              </Label>
              <Input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="예: 고2 수학반 A"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>설명</Label>
              <textarea
                value={newClassDesc}
                onChange={(e) => setNewClassDesc(e.target.value)}
                placeholder="클래스에 대한 설명을 입력하세요 (선택)"
                rows={3}
                className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
          <DialogFooter className="mt-6 gap-2">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              취소
            </Button>
            <Button
              onClick={handleCreateClass}
              disabled={creating || !newClassName.trim()}
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function StatCard({
  label,
  value,
  unit,
  icon: Icon,
}: {
  label: string;
  value: number;
  unit: string;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-2xl font-bold text-foreground">
            {value}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              {unit}
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
