"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MessageSquare,
  Home,
  Loader2,
  Users,
  UserRound,
  Heart,
} from "lucide-react";
import { getMyClasses, getClassStudents } from "@/lib/api/teacher";
import type { ClassInfo, StudentInfo } from "@/lib/api/teacher";

interface ParentInfo {
  id: string;
  name: string;
  studentName: string;
  className: string;
  phone: string;
  email: string;
}

const avatarGradients = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-orange-500 to-rose-600",
  "from-cyan-500 to-blue-600",
  "from-pink-500 to-fuchsia-600",
];

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
      <div className="flex flex-col min-h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm text-muted-foreground">학부모 정보를 불러오는 중...</p>
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
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">학부모 관리</h1>
                <p className="text-xs text-muted-foreground mt-0.5">학부모 연락처와 소통 현황을 확인하세요</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <Users className="w-3.5 h-3.5" /> 학부모 {parents.length}명
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <UserRound className="w-3.5 h-3.5" /> 학생 {parents.length}명
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                <Home className="w-3.5 h-3.5" /> {classCount}개 반
              </span>
              <Button size="sm" className="rounded-lg ml-2 bg-blue-600 hover:bg-blue-700 shadow-sm h-8 text-xs">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                일괄 메시지
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="학부모명 또는 학생명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-lg h-10"
            />
          </div>
        </div>
      </div>

      {/* ─── Parent Cards Grid ─── */}
      <div className="flex-1 p-6 bg-gray-50/60">
        <div className="max-w-7xl mx-auto">
          {filteredParents.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredParents.map((parent, idx) => {
                const grad = avatarGradients[idx % avatarGradients.length];
                return (
                  <div
                    key={parent.id}
                    className="group rounded-2xl border bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white text-lg shadow-sm shrink-0`}>
                        <Home className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{parent.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            <UserRound className="w-3 h-3" />
                            {parent.studentName}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600 font-medium">
                            {parent.className}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-md h-8 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                        쪽지 보내기
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white py-20">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {searchTerm ? "검색 결과가 없습니다" : "등록된 학부모가 없습니다"}
              </h3>
              <p className="text-sm text-muted-foreground text-center px-8">
                {searchTerm
                  ? "다른 검색어를 시도해보세요"
                  : "학생이 등록되면 학부모 정보가 자동으로 표시됩니다"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
