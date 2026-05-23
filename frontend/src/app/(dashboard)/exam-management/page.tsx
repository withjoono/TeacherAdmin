"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  Loader2,
  CheckCircle2,
  Save,
  BarChart3,
  Award,
} from "lucide-react";
import { getMyArenaClasses } from "@/lib/api/classes";
import type { ArenaClass } from "@/lib/api/classes";
import {
  getLessonPlans,
  getClassStudents,
  createTest,
  bulkInputTestResults,
  getTestResults,
} from "@/lib/api/teacher";
import type { LessonPlan, StudentInfo, TestResult } from "@/lib/api/teacher";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ================================
// 메인 페이지
// ================================
export default function ExamManagementPage() {
  const [classes, setClasses] = useState<ArenaClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // 현재 탭 상태
  const [activeTab, setActiveTab] = useState("create"); // "create", "grade", "results"

  // 시험 생성
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [testTitle, setTestTitle] = useState("");
  const [testDesc, setTestDesc] = useState("");
  const [testDate, setTestDate] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [createdTests, setCreatedTests] = useState<any[]>([]);

  // 성적 입력
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [scores, setScores] = useState<Record<string, string>>({});
  const [scoreSaving, setScoreSaving] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  // 결과 조회
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  // 클래스 로드
  useEffect(() => {
    async function fetchClasses() {
      try {
        setLoading(true);
        const data = await getMyArenaClasses();
        setClasses(data || []);
        if (data && data.length > 0) {
          setSelectedClassId(String(data[0].id));
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  // 수업 계획 + 학생 목록 로드
  useEffect(() => {
    if (!selectedClassId) return;

    async function fetchData() {
      try {
        setPlansLoading(true);
        setStudentsLoading(true);
        const [plans, studs] = await Promise.all([
          getLessonPlans(selectedClassId),
          getClassStudents(selectedClassId),
        ]);
        setLessonPlans(plans || []);
        setStudents(studs || []);
        if (plans && plans.length > 0) {
          setSelectedLessonId(plans[0].id);
        }
        // 점수 초기화
        const initScores: Record<string, string> = {};
        (studs || []).forEach((s: StudentInfo) => {
          initScores[s.id] = "";
        });
        setScores(initScores);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setPlansLoading(false);
        setStudentsLoading(false);
      }
    }
    fetchData();
  }, [selectedClassId]);

  // 시험 생성
  const handleCreateTest = async () => {
    if (!selectedClassId || !selectedLessonId || !testTitle.trim()) return;
    try {
      setCreating(true);
      const result = await createTest(selectedClassId, {
        lessonId: selectedLessonId,
        title: testTitle.trim(),
        description: testDesc.trim() || undefined,
        testDate: testDate || undefined,
        maxScore: Number(maxScore) || 100,
      });
      setCreatedTests((prev) => [...prev, result]);
      setCreated(true);
      setTestTitle("");
      setTestDesc("");
      setTestDate("");
      setMaxScore("100");
      setTimeout(() => setCreated(false), 3000);
    } catch (err) {
      console.error("Failed to create test:", err);
      alert("시험 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  };

  // 성적 일괄 입력
  const handleBulkScore = async () => {
    if (!selectedClassId || !selectedTestId) return;
    try {
      setScoreSaving(true);
      const results = Object.entries(scores)
        .filter(([_, score]) => score !== "")
        .map(([studentId, score]) => ({
          studentId,
          score: Number(score),
        }));
      if (results.length === 0) {
        alert("점수를 입력하세요.");
        return;
      }
      await bulkInputTestResults(selectedClassId, selectedTestId, { results });
      setScoreSaved(true);
      setTimeout(() => setScoreSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save scores:", err);
      alert("성적 저장에 실패했습니다.");
    } finally {
      setScoreSaving(false);
    }
  };

  // 결과 조회
  const fetchResults = async (testId: string) => {
    if (!selectedClassId || !testId) return;
    try {
      setResultsLoading(true);
      const data = await getTestResults(selectedClassId, testId);
      setTestResults(data || []);
    } catch (err) {
      console.error("Failed to fetch results:", err);
      setTestResults([]);
    } finally {
      setResultsLoading(false);
    }
  };

  // 결과 통계
  const resultStats = testResults.length > 0
    ? {
      avg: Math.round(
        testResults.reduce((s, r) => s + r.score, 0) / testResults.length
      ),
      max: Math.max(...testResults.map((r) => r.score)),
      min: Math.min(...testResults.map((r) => r.score)),
    }
    : null;

  if (loading) {
    return (
      <PageContainer className="space-y-6">
        <PageHeader
          title="시험 관리"
          description="수업에 포함되는 시험을 생성하고 성적을 입력/조회하세요"
        />
        <Spinner full label="불러오는 중..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="시험 관리"
        description="수업에 포함되는 시험을 생성하고 성적을 입력/조회하세요"
      />

      {/* 클래스 선택 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">클래스 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {classes.map((cls) => (
              <Button
                key={cls.id}
                variant={String(cls.id) === selectedClassId ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedClassId(String(cls.id))}
              >
                {cls.name}
              </Button>
            ))}
            {classes.length === 0 && (
              <span className="text-sm text-muted-foreground">클래스가 없습니다.</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="create" className="gap-2">
            <Plus className="h-4 w-4" />
            시험 생성
          </TabsTrigger>
          <TabsTrigger value="grade" className="gap-2">
            <FileText className="h-4 w-4" />
            성적 입력
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            결과 조회
          </TabsTrigger>
        </TabsList>

        {/* 시험 생성 */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-[18px] w-[18px] text-primary" />
                새 시험 만들기
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-[600px] space-y-4">
                {created && (
                  <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    시험이 생성되었습니다!
                  </div>
                )}

                <div className="space-y-2">
                  <Label>연결할 수업 계획</Label>
                  {plansLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <select
                      value={selectedLessonId}
                      onChange={(e) => setSelectedLessonId(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">수업 계획을 선택하세요</option>
                      {lessonPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-title">
                    시험 제목 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="test-title"
                    type="text"
                    placeholder="예: 1차 중간고사"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-desc">설명</Label>
                  <textarea
                    id="test-desc"
                    placeholder="시험에 대한 설명 (선택사항)"
                    value={testDesc}
                    onChange={(e) => setTestDesc(e.target.value)}
                    rows={2}
                    className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="test-date">시험일</Label>
                    <Input
                      id="test-date"
                      type="date"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="test-max">만점</Label>
                    <Input
                      id="test-max"
                      type="number"
                      value={maxScore}
                      onChange={(e) => setMaxScore(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleCreateTest}
                  disabled={creating || !testTitle.trim() || !selectedLessonId}
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  시험 생성
                </Button>
              </div>

              {/* 생성된 시험 목록 */}
              {createdTests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    이번 세션에서 생성한 시험
                  </h4>
                  {createdTests.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-3 text-sm"
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      {t.title || t.id}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 성적 입력 */}
        <TabsContent value="grade">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-[18px] w-[18px] text-primary" />
                성적 일괄 입력
              </CardTitle>
              <div className="flex items-center gap-2">
                <select
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  className="flex h-9 w-[200px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">시험 선택</option>
                  {createdTests.map((t, i) => (
                    <option key={i} value={t.id}>
                      {t.title || `시험 ${i + 1}`}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleBulkScore}
                  disabled={scoreSaving || !selectedTestId}
                >
                  {scoreSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  저장
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {scoreSaved && (
                <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  성적이 저장되었습니다!
                </div>
              )}

              {studentsLoading ? (
                <Spinner label="불러오는 중..." />
              ) : students.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">학생</TableHead>
                      <TableHead className="w-[30%]">점수</TableHead>
                      <TableHead className="w-[40%] text-right">상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="text-sm font-medium text-foreground">
                          {student.name}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="점수"
                            value={scores[student.id] || ""}
                            onChange={(e) =>
                              setScores((prev) => ({
                                ...prev,
                                [student.id]: e.target.value,
                              }))
                            }
                            className="h-8 w-[100px]"
                            min={0}
                            max={Number(maxScore) || 100}
                          />
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {scores[student.id] ? (
                            <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              입력됨
                            </span>
                          ) : (
                            <span className="text-muted-foreground">미입력</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState icon={FileText} title="학생이 없습니다" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 결과 조회 */}
        <TabsContent value="results">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-[18px] w-[18px] text-primary" />
                시험 결과
              </CardTitle>
              <select
                value={selectedTestId}
                onChange={(e) => {
                  setSelectedTestId(e.target.value);
                  if (e.target.value) fetchResults(e.target.value);
                }}
                className="flex h-9 w-[200px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">시험 선택</option>
                {createdTests.map((t, i) => (
                  <option key={i} value={t.id}>
                    {t.title || `시험 ${i + 1}`}
                  </option>
                ))}
              </select>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 통계 카드 */}
              {resultStats && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-muted/40 p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {resultStats.avg}점
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">평균</div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {resultStats.max}점
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">최고점</div>
                  </div>
                  <div className="rounded-lg bg-rose-50 p-4 text-center">
                    <div className="text-2xl font-bold text-rose-600">
                      {resultStats.min}점
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">최저점</div>
                  </div>
                </div>
              )}

              {/* 성적 분포 바 */}
              {testResults.length > 0 && (
                <div>
                  <div className="mb-3 text-sm font-semibold text-foreground">
                    성적 분포
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "90+", color: "bg-emerald-500" },
                      { label: "80-89", color: "bg-primary" },
                      { label: "70-79", color: "bg-amber-500" },
                      { label: "60-69", color: "bg-amber-500" },
                      { label: "60미만", color: "bg-rose-500" },
                    ].map(({ label, color }) => {
                      const count = testResults.filter((r) => {
                        if (label === "90+") return r.score >= 90;
                        if (label === "80-89")
                          return r.score >= 80 && r.score < 90;
                        if (label === "70-79")
                          return r.score >= 70 && r.score < 80;
                        if (label === "60-69")
                          return r.score >= 60 && r.score < 70;
                        return r.score < 60;
                      }).length;
                      const percent = Math.round(
                        (count / testResults.length) * 100
                      );
                      return (
                        <div key={label} className="flex items-center gap-3">
                          <span className="w-12 text-right text-xs text-muted-foreground">
                            {label}
                          </span>
                          <div className="h-4 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn("h-full rounded-full transition-all", color)}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-8 text-xs text-muted-foreground">
                            {count}명
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 학생별 결과 테이블 */}
              {resultsLoading ? (
                <Spinner label="불러오는 중..." />
              ) : testResults.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">학생</TableHead>
                      <TableHead className="w-[30%]">점수</TableHead>
                      <TableHead className="w-[30%] text-right">등급</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testResults
                      .slice()
                      .sort((a, b) => b.score - a.score)
                      .map((result, idx) => (
                        <TableRow key={result.studentId}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {idx < 3 && (
                                <Award
                                  className={cn(
                                    "h-4 w-4",
                                    idx === 0
                                      ? "text-amber-500"
                                      : idx === 1
                                        ? "text-muted-foreground"
                                        : "text-rose-500",
                                  )}
                                />
                              )}
                              <span className="text-sm font-medium text-foreground">
                                {result.studentName || result.studentId}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-foreground">
                            {result.score}점
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                result.score >= 90
                                  ? "bg-emerald-100 text-emerald-700"
                                  : result.score >= 80
                                    ? "bg-primary/10 text-primary"
                                    : result.score >= 70
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-rose-100 text-rose-700",
                              )}
                            >
                              {result.score >= 90
                                ? "우수"
                                : result.score >= 80
                                  ? "양호"
                                  : result.score >= 70
                                    ? "보통"
                                    : result.score >= 60
                                      ? "미흡"
                                      : "부진"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title={selectedTestId ? "시험 결과가 없습니다" : "시험을 선택하세요"}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
