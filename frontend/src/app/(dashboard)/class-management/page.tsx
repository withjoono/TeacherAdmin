"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  Plus,
  Loader2,
  UserPlus,
  BarChart3,
  X,
  Copy,
  CheckCircle2,
  GraduationCap,
  Hash,
  Crown,
  User,
  Layers,
  TrendingUp,
} from "lucide-react";
import { getMyArenaClasses, createArenaClass, getClassMembers } from "@/lib/api/classes";
import type { ArenaClass, ClassMember } from "@/lib/api/classes";

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

  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-violet-500 to-purple-600",
    "from-orange-500 to-rose-600",
    "from-cyan-500 to-blue-600",
    "from-pink-500 to-fuchsia-600",
  ];

  const totalMembers = classes.reduce((sum, c) => sum + (c.memberCount || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col min-h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm text-muted-foreground">클래스를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── Compact Header ─── */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">클래스 관리</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {classes.length > 0
                    ? `${classes.length}개의 클래스를 관리하고 있습니다`
                    : "새로운 클래스를 만들어 학생을 관리하세요"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <Layers className="w-3.5 h-3.5" /> {classes.length}개 클래스
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <Users className="w-3.5 h-3.5" /> 멤버 {totalMembers}명
              </span>
              <Button
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className="rounded-lg ml-2 bg-blue-600 hover:bg-blue-700 shadow-sm h-8 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                클래스 생성
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="flex-1 p-6 bg-gray-50/60">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* ─── Class Cards Grid ─── */}
          {classes.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((cls, idx) => {
                const isSelected = cls.id === selectedClass;
                const grad = gradients[idx % gradients.length];
                return (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls.id)}
                    className={`group relative text-left rounded-2xl border-2 p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                      isSelected
                        ? "border-blue-400 bg-white shadow-md"
                        : "border-transparent bg-white hover:border-gray-200 shadow-sm"
                    }`}
                  >
                    {/* Gradient accent strip */}
                    <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${grad} ${isSelected ? "opacity-100" : "opacity-30 group-hover:opacity-60"} transition-opacity`} />
                    
                    <div className="flex items-start gap-4 mt-1">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white font-bold text-lg shadow-sm`}>
                        {cls.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{cls.name}</h3>
                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {cls.memberCount || 0}명
                          </span>
                          <span className="flex items-center gap-1 font-mono text-xs">
                            <Hash className="w-3 h-3" />
                            {cls.inviteCode}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white py-20 px-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 mb-4">
                <GraduationCap className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-1">아직 클래스가 없습니다</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                클래스를 생성하고 학생들을 초대해보세요
              </p>
              <Button onClick={() => setShowCreateModal(true)} className="rounded-lg shadow-sm bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                첫 클래스 만들기
              </Button>
            </div>
          )}

          {/* ─── Selected Class Detail ─── */}
          {selectedArena && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left: Class Info */}
              <div className="space-y-4">
                {/* Invite Code Card */}
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">초대 코드</p>
                  <div className="flex items-center gap-3">
                    <code className="text-2xl font-bold font-mono tracking-[0.2em] text-blue-600">
                      {selectedArena.inviteCode}
                    </code>
                    <button
                      onClick={() => copyInviteCode(selectedArena.inviteCode)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      {copiedCode === selectedArena.inviteCode ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">학생에게 이 코드를 공유하세요</p>
                </div>

                {/* Quick Actions */}
                <Link href={`/class-management/students?id=${selectedArena.id}`}>
                  <div className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">학생 임포트</p>
                      <p className="text-xs text-muted-foreground">학생 ID로 일괄 등록</p>
                    </div>
                  </div>
                </Link>

                <Link href={`/class-management/stats?id=${selectedArena.id}`}>
                  <div className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group mt-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">학습 통계</p>
                      <p className="text-xs text-muted-foreground">일간/주간 학습량 분석</p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Right: Members List */}
              <div className="lg:col-span-2 rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">멤버 목록</h3>
                    {members.length > 0 && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {members.length}명
                      </span>
                    )}
                  </div>
                  <Link href={`/class-management/students?id=${selectedClass}`}>
                    <Button size="sm" variant="outline" className="rounded-lg h-8 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200">
                      <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                      학생 추가
                    </Button>
                  </Link>
                </div>

                <div className="p-3">
                  {membersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : members.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                            <th className="text-left py-2 px-3 font-medium">#</th>
                            <th className="text-left py-2 px-3 font-medium">이름</th>
                            <th className="text-left py-2 px-3 font-medium">아이디</th>
                            <th className="text-right py-2 px-3 font-medium">역할</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member, idx) => (
                            <tr
                              key={member.memberId}
                              className="border-t hover:bg-blue-50/50 transition-colors"
                            >
                              <td className="py-3 px-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-3">
                                  <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${gradients[idx % gradients.length]} text-white text-xs font-bold`}>
                                    {member.nickname?.charAt(0) || "?"}
                                  </div>
                                  <span className="font-medium text-sm">{member.nickname}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-sm text-muted-foreground">
                                {member.authMemberId || member.email || "—"}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                                    member.role === "owner"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {member.role === "owner" ? (
                                    <><Crown className="w-3 h-3" /> 관리자</>
                                  ) : (
                                    <><User className="w-3 h-3" /> 학생</>
                                  )}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Users className="w-10 h-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">등록된 멤버가 없습니다</p>
                      <p className="text-xs text-muted-foreground">&quot;학생 추가&quot; 버튼으로 학생을 등록하세요</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Create Class Modal ─── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-md mx-4 rounded-2xl border bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">새 클래스 생성</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  클래스 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="예: 고2 수학반 A"
                  className="w-full px-4 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">설명</label>
                <textarea
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="클래스에 대한 설명을 입력하세요 (선택)"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="rounded-xl">
                취소
              </Button>
              <Button
                onClick={handleCreateClass}
                disabled={creating || !newClassName.trim()}
                className="rounded-xl shadow-md bg-blue-600 hover:bg-blue-700"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                생성
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
