"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MessageSquare,
  Home,
  Loader2,
  Users,
  UserRound,
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

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="학부모 관리" />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">학부모 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header title="학부모 관리" />

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ─── Header + Search ─── */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">학부모 관리</h1>
                <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                  {parents.length}명
                </span>
              </div>
              <Button className="shadow-md hover:shadow-lg transition-all rounded-xl">
                <MessageSquare className="w-4 h-4 mr-2" />
                일괄 메시지 발송
              </Button>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="학부모명 또는 학생명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl h-11"
              />
            </div>
          </div>

          {/* ─── Parent Cards Grid ─── */}
          {filteredParents.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredParents.map((parent, idx) => {
                const grad = avatarGradients[idx % avatarGradients.length];
                return (
                  <div
                    key={parent.id}
                    className="group rounded-2xl border bg-card p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white text-lg shadow-sm shrink-0`}>
                        <Home className="w-5 h-5" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">{parent.name}</h3>
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

                    {/* Action */}
                    <div className="mt-4 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-lg hover:bg-primary/5 hover:border-primary/30 transition-all"
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
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/30 py-16">
              <Users className="w-14 h-14 text-muted-foreground/30 mb-4" />
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
