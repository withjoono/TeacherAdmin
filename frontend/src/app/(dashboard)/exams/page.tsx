"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, FileText } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { mockExamApi, type MockExam } from "@/lib/api";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default function ExamsPage() {
  const { accessToken } = useAuthStore();
  const [exams, setExams] = useState<MockExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (accessToken) {
      loadExams();
    }
  }, [accessToken]);

  const loadExams = async () => {
    if (!accessToken) return;
    try {
      const data = await mockExamApi.getAll(accessToken);
      setExams(data);
    } catch (error) {
      console.error("Failed to load exams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!accessToken) return;
    if (!confirm("정말로 이 시험을 삭제하시겠습니까?")) return;

    try {
      await mockExamApi.delete(id, accessToken);
      setExams(exams.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Failed to delete exam:", error);
      alert("시험 삭제에 실패했습니다.");
    }
  };

  const filteredExams = exams.filter(
    (exam) =>
      exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="시험 관리"
        description="출제된 시험 목록을 조회하고 새 시험을 생성하세요."
        actions={
          <Link href="/exams/new">
            <Button>
              <Plus className="h-4 w-4" />
              새 시험 생성
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="시험 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <Spinner label="시험 목록을 불러오는 중..." />
          ) : filteredExams.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={searchQuery ? "검색 결과가 없습니다" : "등록된 시험이 없습니다"}
              description={
                searchQuery
                  ? "다른 검색어로 시도해보세요."
                  : "새 시험을 생성해주세요."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>코드</TableHead>
                  <TableHead>시험명</TableHead>
                  <TableHead>학년</TableHead>
                  <TableHead>년도</TableHead>
                  <TableHead>월</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-mono text-muted-foreground">
                      {exam.code}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {exam.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {exam.grade}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {exam.year}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {exam.month}월
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {exam.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/exams/${exam.id}`}>
                          <Button variant="outline" size="icon">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(exam.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
