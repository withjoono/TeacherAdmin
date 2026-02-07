"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Users,
  FileText,
  ListChecks,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import type { LessonRecord, UpdateLessonRecordDto } from "@/lib/api/curriculum";
import {
  getLessonRecords,
  createLessonRecord,
  updateLessonRecord,
  deleteLessonRecord,
} from "@/lib/api/curriculum";

import { LessonRecordForm } from "./_components/lesson-plan-form";
import { AttendanceTable } from "./_components/attendance-table";
import { CommentSection } from "./_components/comment-section";

// ================================
// Mock 클래스 데이터
// ================================
const mockClasses = [
  { id: "class-a", name: "A반", studentCount: 5, subject: "수학" },
  { id: "class-b", name: "B반", studentCount: 3, subject: "영어" },
  { id: "class-c", name: "C반", studentCount: 2, subject: "국어" },
];

// ================================
// 메인 페이지
// ================================
export default function CurriculumManagementPage() {
  const [selectedClass, setSelectedClass] = useState(mockClasses[0].id);
  const [records, setRecords] = useState<LessonRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // 펼침/접힘 관리
  const [expandedRecords, setExpandedRecords] = useState<Set<number>>(new Set());

  // 수정 다이얼로그
  const [editingRecord, setEditingRecord] = useState<LessonRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    date: "", time: "", content: "",
    assignmentResult: "", nextAssignment: "", testResult: "",
  });

  const selectedClassInfo = mockClasses.find((c) => c.id === selectedClass);

  // 데이터 로드
  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLessonRecords(selectedClass);
      setRecords(data);
      // 최신 기록 자동 펼침
      if (data.length > 0) {
        setExpandedRecords(new Set([data[0].id]));
      }
    } finally {
      setLoading(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // 펼침 토글
  const toggleExpand = (id: number) => {
    setExpandedRecords(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 수업 기록 추가
  const handleCreate = async (data: Parameters<typeof createLessonRecord>[0]) => {
    setActionLoading(true);
    try {
      await createLessonRecord(data);
      await loadRecords();
    } finally {
      setActionLoading(false);
    }
  };

  // 수정 다이얼로그 열기
  const openEditDialog = (record: LessonRecord) => {
    setEditingRecord(record);
    setEditForm({
      date: record.date,
      time: record.time,
      content: record.content,
      assignmentResult: record.assignmentResult || "",
      nextAssignment: record.nextAssignment || "",
      testResult: record.testResult || "",
    });
    setEditDialogOpen(true);
  };

  // 수정 저장
  const handleUpdate = async () => {
    if (!editingRecord) return;
    setActionLoading(true);
    try {
      await updateLessonRecord(editingRecord.id, selectedClass, {
        date: editForm.date,
        time: editForm.time,
        content: editForm.content,
        assignmentResult: editForm.assignmentResult || undefined,
        nextAssignment: editForm.nextAssignment || undefined,
        testResult: editForm.testResult || undefined,
      });
      await loadRecords();
      setEditDialogOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  // 삭제
  const handleDelete = async (id: number) => {
    if (!confirm("이 수업 기록을 삭제하시겠습니까?")) return;
    setActionLoading(true);
    try {
      await deleteLessonRecord(id, selectedClass);
      await loadRecords();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Header title="수업 현황 관리" />

      <div className="flex-1 p-6 space-y-5">
        {/* ========== 반 선택 ========== */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm font-medium text-muted-foreground mr-2">반 선택</span>
              {mockClasses.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${cls.id === selectedClass
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted hover:bg-muted/80"
                    }`}
                >
                  {cls.name}
                  <span className="ml-1.5 text-xs opacity-80">
                    ({cls.studentCount}명 · {cls.subject})
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ========== 수업 기록 헤더 ========== */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {selectedClassInfo?.name} 수업계획 / 현황
            </h2>
            <p className="text-sm text-muted-foreground">
              수업 내용을 기록하고 학생들의 출석과 과제를 관리하세요
            </p>
          </div>
          <LessonRecordForm
            classId={selectedClass}
            onSubmit={handleCreate}
            isLoading={actionLoading}
          />
        </div>

        {/* ========== 수업 기록 목록 ========== */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              로딩 중...
            </CardContent>
          </Card>
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <BookOpen className="w-14 h-14 mb-4 opacity-30" />
              <p className="text-lg font-medium">아직 수업 기록이 없습니다</p>
              <p className="text-sm mt-1">&quot;수업 기록 추가&quot; 버튼으로 첫 수업을 기록하세요</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((record) => {
              const isExpanded = expandedRecords.has(record.id);

              return (
                <Card key={record.id} className="overflow-hidden">
                  {/* 접힌 상태: 요약 헤더 */}
                  <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-accent/30 transition-colors"
                    onClick={() => toggleExpand(record.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold">{record.date}</span>
                          <span className="text-muted-foreground">({record.dayOfWeek})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{record.time}</span>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground hidden md:inline">
                        — {record.content.split('\n')[0].substring(0, 40)}
                        {record.content.length > 40 ? '...' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline" size="sm"
                        onClick={() => openEditDialog(record)}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        수정
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        onClick={() => handleDelete(record.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* 펼친 상태: 상세 */}
                  {isExpanded && (
                    <div className="border-t">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x">
                        {/* 왼쪽: 수업 정보 */}
                        <div className="lg:col-span-2 p-5 space-y-5">
                          {/* 수업내용 */}
                          <div>
                            <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2 text-blue-700">
                              <FileText className="w-4 h-4" />
                              수업내용
                            </h4>
                            <div className="bg-blue-50/50 rounded-lg p-3 text-sm whitespace-pre-line leading-relaxed">
                              {record.content}
                            </div>
                          </div>

                          {/* 과제 결과 + 다음 과제 + 테스트 결과 */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2 text-green-700">
                                <CheckCircle2 className="w-4 h-4" />
                                과제 결과
                              </h4>
                              <div className="bg-green-50/50 rounded-lg p-3 text-sm min-h-[60px]">
                                {record.assignmentResult || (
                                  <span className="text-muted-foreground italic">기록 없음</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2 text-orange-700">
                                <ClipboardList className="w-4 h-4" />
                                다음 과제
                              </h4>
                              <div className="bg-orange-50/50 rounded-lg p-3 text-sm min-h-[60px]">
                                {record.nextAssignment || (
                                  <span className="text-muted-foreground italic">기록 없음</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2 text-purple-700">
                                <ListChecks className="w-4 h-4" />
                                테스트 결과
                              </h4>
                              <div className="bg-purple-50/50 rounded-lg p-3 text-sm min-h-[60px]">
                                {record.testResult || (
                                  <span className="text-muted-foreground italic">기록 없음</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 출석/지각 현황 */}
                          <div>
                            <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2 text-teal-700">
                              <Users className="w-4 h-4" />
                              출석/지각 현황
                            </h4>
                            <div className="border rounded-lg p-3">
                              <AttendanceTable lessonRecordId={record.id} classId={selectedClass} />
                            </div>
                          </div>
                        </div>

                        {/* 오른쪽: 코멘트 */}
                        <div className="p-5 bg-muted/20">
                          <CommentSection lessonRecordId={record.id} />
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ========== 수정 다이얼로그 ========== */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>수업 기록 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>날짜</Label>
                <Input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>시간</Label>
                <Input value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>수업내용</Label>
              <textarea
                rows={4}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>과제 결과</Label>
              <Input value={editForm.assignmentResult} onChange={(e) => setEditForm({ ...editForm, assignmentResult: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>다음 과제</Label>
              <Input value={editForm.nextAssignment} onChange={(e) => setEditForm({ ...editForm, nextAssignment: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>테스트 결과</Label>
              <Input value={editForm.testResult} onChange={(e) => setEditForm({ ...editForm, testResult: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button onClick={handleUpdate} disabled={actionLoading}>
              {actionLoading ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
