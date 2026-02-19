"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Plus,
  FileText,
  Users,
  Loader2,
  CheckCircle2,
  Save,
  BarChart3,
  Calendar,
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

// ================================
// 메인 페이지
// ================================
export default function ExamManagementPage() {
  const [classes, setClasses] = useState<ArenaClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [loading, setLoading] = useState(true);

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
      <div className="flex flex-col">
        <Header title="시험 관리" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header title="시험 관리" />

      <div className="flex-1 p-6 space-y-6">
        {/* 클래스 선택 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm font-medium text-muted-foreground mr-2">
                클래스
              </span>
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(String(cls.id))}
                  className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${String(cls.id) === selectedClassId
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted hover:bg-muted/80"
                    }`}
                >
                  {cls.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 탭 */}
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">
              <Plus className="w-4 h-4 mr-2" />
              시험 생성
            </TabsTrigger>
            <TabsTrigger value="grade">
              <FileText className="w-4 h-4 mr-2" />
              성적 입력
            </TabsTrigger>
            <TabsTrigger value="results">
              <BarChart3 className="w-4 h-4 mr-2" />
              결과 조회
            </TabsTrigger>
          </TabsList>

          {/* 시험 생성 */}
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  새 시험 만들기
                </CardTitle>
              </CardHeader>
              <CardContent>
                {created && (
                  <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    시험이 생성되었습니다!
                  </div>
                )}
                <div className="space-y-4 max-w-lg">
                  {/* 수업 계획 선택 */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      연결할 수업 계획
                    </label>
                    {plansLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <select
                        value={selectedLessonId}
                        onChange={(e) => setSelectedLessonId(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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

                  {/* 시험 제목 */}
                  <div>
                    <label className="block text-sm font-medium mb-1">시험 제목 *</label>
                    <Input
                      placeholder="예: 1차 중간고사"
                      value={testTitle}
                      onChange={(e) => setTestTitle(e.target.value)}
                    />
                  </div>

                  {/* 설명 */}
                  <div>
                    <label className="block text-sm font-medium mb-1">설명</label>
                    <textarea
                      placeholder="시험에 대한 설명 (선택사항)"
                      value={testDesc}
                      onChange={(e) => setTestDesc(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* 시험일 */}
                    <div>
                      <label className="block text-sm font-medium mb-1">시험일</label>
                      <Input
                        type="date"
                        value={testDate}
                        onChange={(e) => setTestDate(e.target.value)}
                      />
                    </div>
                    {/* 만점 */}
                    <div>
                      <label className="block text-sm font-medium mb-1">만점</label>
                      <Input
                        type="number"
                        value={maxScore}
                        onChange={(e) => setMaxScore(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateTest}
                    disabled={creating || !testTitle.trim() || !selectedLessonId}
                    className="w-full"
                  >
                    {creating ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    시험 생성
                  </Button>
                </div>

                {/* 생성된 시험 목록 */}
                {createdTests.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      이번 세션에서 생성한 시험
                    </h4>
                    {createdTests.map((t, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border bg-accent/30 text-sm flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-primary" />
                        {t.title || t.id}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 성적 입력 */}
          <TabsContent value="grade" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    성적 일괄 입력
                  </CardTitle>
                  <div className="flex gap-2">
                    <select
                      value={selectedTestId}
                      onChange={(e) => setSelectedTestId(e.target.value)}
                      className="px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      저장
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {scoreSaved && (
                  <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    성적이 저장되었습니다!
                  </div>
                )}

                {studentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : students.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                      <div>학생</div>
                      <div>점수</div>
                      <div>진행상태</div>
                    </div>
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="grid grid-cols-3 gap-4 items-center px-4 py-3 rounded-lg hover:bg-accent/30"
                      >
                        <div className="font-medium">{student.name}</div>
                        <div>
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
                            className="w-24"
                            min={0}
                            max={Number(maxScore) || 100}
                          />
                        </div>
                        <div>
                          {scores[student.id] ? (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              입력됨
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              미입력
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    학생이 없습니다
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 결과 조회 */}
          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    시험 결과
                  </CardTitle>
                  <div className="flex gap-2">
                    <select
                      value={selectedTestId}
                      onChange={(e) => {
                        setSelectedTestId(e.target.value);
                        if (e.target.value) fetchResults(e.target.value);
                      }}
                      className="px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">시험 선택</option>
                      {createdTests.map((t, i) => (
                        <option key={i} value={t.id}>
                          {t.title || `시험 ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 통계 카드 */}
                {resultStats && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-blue-50 text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {resultStats.avg}점
                      </p>
                      <p className="text-xs text-muted-foreground">평균</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {resultStats.max}점
                      </p>
                      <p className="text-xs text-muted-foreground">최고점</p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-50 text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {resultStats.min}점
                      </p>
                      <p className="text-xs text-muted-foreground">최저점</p>
                    </div>
                  </div>
                )}

                {/* 성적 분포 바 */}
                {testResults.length > 0 && (
                  <div className="mb-6 space-y-2">
                    <p className="text-sm font-medium">성적 분포</p>
                    <div className="space-y-1">
                      {[
                        { label: "90+", color: "bg-green-500" },
                        { label: "80-89", color: "bg-blue-500" },
                        { label: "70-79", color: "bg-yellow-500" },
                        { label: "60-69", color: "bg-orange-500" },
                        { label: "60미만", color: "bg-red-500" },
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
                          <div key={label} className="flex items-center gap-2">
                            <span className="text-xs w-12 text-right text-muted-foreground">
                              {label}
                            </span>
                            <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${color} rounded-full transition-all`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-xs w-8 text-muted-foreground">
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
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : testResults.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                      <div>학생</div>
                      <div>점수</div>
                      <div>등급</div>
                    </div>
                    {testResults
                      .sort((a, b) => b.score - a.score)
                      .map((result, idx) => (
                        <div
                          key={result.studentId}
                          className="grid grid-cols-3 gap-4 items-center px-4 py-3 rounded-lg hover:bg-accent/30"
                        >
                          <div className="flex items-center gap-2">
                            {idx < 3 && (
                              <Award
                                className={`w-4 h-4 ${idx === 0
                                    ? "text-yellow-500"
                                    : idx === 1
                                      ? "text-gray-400"
                                      : "text-orange-400"
                                  }`}
                              />
                            )}
                            <span className="font-medium">
                              {result.studentName || result.studentId}
                            </span>
                          </div>
                          <div className="font-semibold">{result.score}점</div>
                          <div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${result.score >= 90
                                  ? "bg-green-100 text-green-700"
                                  : result.score >= 80
                                    ? "bg-blue-100 text-blue-700"
                                    : result.score >= 70
                                      ? "bg-yellow-100 text-yellow-700"
                                      : result.score >= 60
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-red-100 text-red-700"
                                }`}
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
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    {selectedTestId
                      ? "시험 결과가 없습니다"
                      : "시험을 선택하세요"}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
