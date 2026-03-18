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
  Mail,
  Phone,
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
  "from-purple-500 to-fuchsia-600",
  "from-teal-500 to-emerald-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-blue-500 to-cyan-600",
  "from-indigo-500 to-violet-600",
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

  // Get unique class count
  const classCount = new Set(parents.map(p => p.className)).size;

  if (loading) {
    return (
      <div className="flex flex-col min-h-[80vh]">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">학부모 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* ─── Hero Banner ─── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-300/30 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-gradient-to-r from-fuchsia-400/20 to-transparent rounded-full blur-3xl rotate-12" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">학부모 관리</h1>
                <p className="text-purple-100/80 text-sm mt-0.5">학부모 연락처와 소통 현황을 확인하세요</p>
              </div>
            </div>
            <Button className="shadow-lg hover:shadow-xl transition-all rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25">
              <MessageSquare className="w-4 h-4 mr-2" />
              일괄 메시지 발송
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-purple-200" />
                <span className="text-xs text-purple-200 font-medium">전체 학부모</span>
              </div>
              <p className="text-2xl font-bold text-white">{parents.length}<span className="text-sm font-normal text-purple-200 ml-1">명</span></p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <UserRound className="w-4 h-4 text-emerald-300" />
                <span className="text-xs text-purple-200 font-medium">담당 학생</span>
              </div>
              <p className="text-2xl font-bold text-white">{parents.length}<span className="text-sm font-normal text-purple-200 ml-1">명</span></p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Home className="w-4 h-4 text-amber-300" />
                <span className="text-xs text-purple-200 font-medium">소속 반</span>
              </div>
              <p className="text-2xl font-bold text-white">{classCount}<span className="text-sm font-normal text-purple-200 ml-1">개</span></p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input
              placeholder="학부모명 또는 학생명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/40"
            />
          </div>
        </div>
      </div>

      {/* ─── Parent Cards Grid ─── */}
      <div className="flex-1 p-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          {filteredParents.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredParents.map((parent, idx) => {
                const grad = avatarGradients[idx % avatarGradients.length];
                return (
                  <div
                    key={parent.id}
                    className="group rounded-2xl border bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white text-lg shadow-md shadow-black/10 shrink-0`}>
                        <Home className="w-5 h-5" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">{parent.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                            <UserRound className="w-3 h-3" />
                            {parent.studentName}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-600 font-medium">
                            {parent.className}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-lg hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-all"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        쪽지 보내기
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white py-20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-purple-400" />
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
