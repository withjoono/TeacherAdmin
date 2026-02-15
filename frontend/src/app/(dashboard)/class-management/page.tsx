"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  FileText,
  ClipboardList,
  Plus,
  Eye,
  TrendingUp,
  Loader2,
  UserPlus,
  BarChart3,
  X,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { getMyArenaClasses, createArenaClass, getClassMembers } from "@/lib/api/classes";
import type { ArenaClass, ClassMember } from "@/lib/api/classes";

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<ArenaClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);

  // 클래스 생성 모달
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassDesc, setNewClassDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // 반 목록 로드
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

  // 선택된 반의 멤버 로드
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

  // 클래스 생성
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
      setShowCreateForm(false);
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

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="클래스 관리" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header title="클래스 관리" />

      <div className="flex-1 p-6 space-y-6">
        {/* 반 선택 + 생성 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>내 클래스</CardTitle>
              <Button size="sm" onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                클래스 생성
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${cls.id === selectedClass
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted hover:bg-muted/80"
                    }`}
                >
                  {cls.name}
                  <span className="ml-2 text-sm opacity-80">
                    ({cls.memberCount || 0}명)
                  </span>
                </button>
              ))}
              {classes.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">
                  생성된 클래스가 없습니다. &quot;클래스 생성&quot; 버튼을 눌러
                  시작하세요.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 클래스 생성 모달 */}
        {showCreateForm && (
          <Card className="border-primary/30 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>새 클래스 생성</CardTitle>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  클래스 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="예: 고2 수학반 A"
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">설명</label>
                <textarea
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="클래스에 대한 설명을 입력하세요 (선택)"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  취소
                </Button>
                <Button
                  onClick={handleCreateClass}
                  disabled={creating || !newClassName.trim()}
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  생성
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 선택된 클래스 정보 & 액션 버튼 */}
        {selectedArena && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">초대 코드</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-lg font-bold font-mono tracking-wider">
                    {selectedArena.inviteCode}
                  </code>
                  <button
                    onClick={() => copyInviteCode(selectedArena.inviteCode)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copiedCode === selectedArena.inviteCode ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
            <Link href={`/class-management/students?id=${selectedArena.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <UserPlus className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">학생 임포트</p>
                    <p className="text-sm text-muted-foreground">
                      학생 ID로 일괄 등록
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href={`/class-management/stats?id=${selectedArena.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">학습 통계</p>
                    <p className="text-sm text-muted-foreground">
                      일간/주간 학습량 분석
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {/* 멤버 목록 */}
        {selectedClass && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  <Users className="w-5 h-5 inline mr-2" />
                  멤버 목록
                </CardTitle>
                <Link
                  href={`/class-management/students?id=${selectedClass}`}
                >
                  <Button size="sm" variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    학생 추가
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : members.length > 0 ? (
                <div className="space-y-2">
                  {members.map((member, idx) => (
                    <div
                      key={member.memberId}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium">{member.nickname}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.authMemberId || member.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${member.role === "owner"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                          }`}
                      >
                        {member.role === "owner" ? "관리자" : "학생"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-8">
                  등록된 멤버가 없습니다. &quot;학생 추가&quot; 버튼으로 학생을
                  등록하세요.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
