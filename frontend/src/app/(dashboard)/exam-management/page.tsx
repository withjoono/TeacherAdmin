"use client";

import { useState, useEffect, useCallback } from "react";
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
      <div className="gb-page-dashboard gb-stack gb-stack-6" style={{ paddingTop: "var(--space-10)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
          <Loader2 style={{ width: 32, height: 32, color: "var(--color-text-disabled)", animation: "spin 1s linear infinite" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="gb-page-dashboard gb-stack gb-stack-8" style={{ paddingTop: "var(--space-10)" }}>
      {/* 페이지 헤더 */}
      <div className="gb-page-header" style={{ marginBottom: 0 }}>
        <h1 className="gb-page-title">시험 관리</h1>
        <p className="gb-page-desc">
          수업에 포함되는 시험을 생성하고 성적을 입력/조회하세요
        </p>
      </div>

      <div className="gb-stack gb-stack-6">
        {/* 클래스 선택 */}
        <div className="gb-card">
          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-3)" }}>
            클래스 선택
          </div>
          <div className="gb-row gb-row-3" style={{ flexWrap: "wrap" }}>
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(String(cls.id))}
                className={`gb-btn ${String(cls.id) === selectedClassId ? 'gb-btn-primary' : 'gb-btn-outline'}`}
              >
                {cls.name}
              </button>
            ))}
            {classes.length === 0 && (
              <span className="gb-page-desc">클래스가 없습니다.</span>
            )}
          </div>
        </div>

        {/* 탭 헤더 */}
        <div style={{ display: "flex", gap: "var(--space-6)", borderBottom: "1px solid var(--color-border-light)" }}>
          {[
            { id: "create", icon: Plus, label: "시험 생성" },
            { id: "grade", icon: FileText, label: "성적 입력" },
            { id: "results", icon: BarChart3, label: "결과 조회" },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "var(--space-3) 0",
                  fontSize: "var(--text-sm)",
                  fontWeight: isActive ? "var(--weight-semibold)" : "var(--weight-medium)",
                  color: isActive ? "var(--color-primary)" : "var(--color-text-tertiary)",
                  borderBottom: isActive ? "2px solid var(--color-primary)" : "2px solid transparent",
                  background: "none", borderTop: "none", borderLeft: "none", borderRight: "none",
                  cursor: "pointer", transition: "all var(--transition-short)"
                }}
              >
                <Icon style={{ width: 16, height: 16 }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 시험 생성 */}
        {activeTab === "create" && (
          <div className="gb-card">
            <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
              새 시험 만들기
            </h2>
            <div className="gb-stack gb-stack-4" style={{ maxWidth: '600px' }}>
              {created && (
                <div style={{ padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--color-success-10)", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-success)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>
                  <CheckCircle2 style={{ width: 16, height: 16 }} />
                  시험이 생성되었습니다!
                </div>
              )}
              
              <div>
                <label className="gb-input-label">
                  연결할 수업 계획
                </label>
                {plansLoading ? (
                  <Loader2 style={{ width: 16, height: 16, color: "var(--color-text-disabled)", animation: "spin 1s linear infinite" }} />
                ) : (
                  <select
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="gb-input"
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

              <div>
                <label className="gb-input-label">시험 제목 <span style={{ color: "var(--color-error)" }}>*</span></label>
                <input
                  type="text"
                  className="gb-input"
                  placeholder="예: 1차 중간고사"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="gb-input-label">설명</label>
                <textarea
                  placeholder="시험에 대한 설명 (선택사항)"
                  value={testDesc}
                  onChange={(e) => setTestDesc(e.target.value)}
                  rows={2}
                  className="gb-input"
                  style={{ resize: "none" }}
                />
              </div>

              <div className="gb-row gb-row-4">
                <div style={{ flex: 1 }}>
                  <label className="gb-input-label">시험일</label>
                  <input
                    type="date"
                    className="gb-input"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="gb-input-label">만점</label>
                  <input
                    type="number"
                    className="gb-input"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="gb-btn gb-btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={handleCreateTest}
                disabled={creating || !testTitle.trim() || !selectedLessonId}
              >
                {creating ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Plus style={{ width: 16, height: 16 }} />}
                시험 생성
              </button>
            </div>

            {/* 생성된 시험 목록 */}
            {createdTests.length > 0 && (
              <div className="gb-stack gb-stack-2" style={{ marginTop: "var(--space-8)" }}>
                <h4 style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-tertiary)" }}>
                  이번 세션에서 생성한 시험
                </h4>
                {createdTests.map((t, i) => (
                  <div key={i} className="gb-row gb-row-2" style={{ padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--color-primary-50, var(--color-bg-secondary))", border: "1px solid var(--color-border-light)", fontSize: "var(--text-sm)" }}>
                    <FileText style={{ width: 16, height: 16, color: "var(--color-primary)" }} />
                    {t.title || t.id}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 성적 입력 */}
        {activeTab === "grade" && (
          <div className="gb-card">
            <div className="gb-row gb-row-4" style={{ justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
              <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
                <FileText style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
                성적 일괄 입력
              </h2>
              <div className="gb-row gb-row-3">
                <select
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  className="gb-input"
                  style={{ width: "200px" }}
                >
                  <option value="">시험 선택</option>
                  {createdTests.map((t, i) => (
                    <option key={i} value={t.id}>
                      {t.title || `시험 ${i + 1}`}
                    </option>
                  ))}
                </select>
                <button
                  className="gb-btn gb-btn-primary"
                  onClick={handleBulkScore}
                  disabled={scoreSaving || !selectedTestId}
                >
                  {scoreSaving ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Save style={{ width: 16, height: 16 }} />}
                  저장
                </button>
              </div>
            </div>

            {scoreSaved && (
              <div style={{ marginBottom: "var(--space-4)", padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--color-success-10)", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-success)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>
                <CheckCircle2 style={{ width: 16, height: 16 }} />
                성적이 저장되었습니다!
              </div>
            )}

            {studentsLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-8) 0" }}>
                <Loader2 style={{ width: 24, height: 24, color: "var(--color-text-disabled)", animation: "spin 1s linear infinite" }} />
              </div>
            ) : students.length > 0 ? (
              <div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--color-border-light)" }}>
                      <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)", width: "30%" }}>학생</th>
                      <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)", width: "30%" }}>점수</th>
                      <th style={{ textAlign: "right", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)", width: "40%" }}>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                        <td style={{ padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{student.name}</td>
                        <td style={{ padding: "var(--space-3)" }}>
                          <input
                            type="number"
                            className="gb-input"
                            placeholder="점수"
                            value={scores[student.id] || ""}
                            onChange={(e) =>
                              setScores((prev) => ({
                                ...prev,
                                [student.id]: e.target.value,
                              }))
                            }
                            style={{ width: "100px", height: "32px" }}
                            min={0}
                            max={Number(maxScore) || 100}
                          />
                        </td>
                        <td style={{ padding: "var(--space-3)", textAlign: "right", fontSize: "var(--text-sm)" }}>
                          {scores[student.id] ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--color-success)", fontWeight: "var(--weight-medium)" }}>
                              <CheckCircle2 style={{ width: 14, height: 14 }} />
                              입력됨
                            </span>
                          ) : (
                            <span style={{ color: "var(--color-text-disabled)" }}>
                              미입력
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="gb-empty-state" style={{ padding: "var(--space-8) 0" }}>
                학생이 없습니다
              </div>
            )}
          </div>
        )}

        {/* 결과 조회 */}
        {activeTab === "results" && (
          <div className="gb-card">
            <div className="gb-row gb-row-4" style={{ justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
              <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
                <BarChart3 style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
                시험 결과
              </h2>
              <div className="gb-row gb-row-3">
                <select
                  value={selectedTestId}
                  onChange={(e) => {
                    setSelectedTestId(e.target.value);
                    if (e.target.value) fetchResults(e.target.value);
                  }}
                  className="gb-input"
                  style={{ width: "200px" }}
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

            {/* 통계 카드 */}
            {resultStats && (
              <div className="gb-grid gb-grid-3" style={{ marginBottom: "var(--space-6)" }}>
                <div style={{ background: "var(--color-primary-50, var(--color-bg-secondary))", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
                  <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-primary)" }}>
                    {resultStats.avg}점
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-1)" }}>평균</div>
                </div>
                <div style={{ background: "var(--color-success-10)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
                  <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-success)" }}>
                    {resultStats.max}점
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-1)" }}>최고점</div>
                </div>
                <div style={{ background: "var(--color-error-10)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
                  <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-error)" }}>
                    {resultStats.min}점
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-1)" }}>최저점</div>
                </div>
              </div>
            )}

            {/* 성적 분포 바 */}
            {testResults.length > 0 && (
              <div style={{ marginBottom: "var(--space-6)" }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", marginBottom: "var(--space-3)" }}>성적 분포</div>
                <div className="gb-stack gb-stack-2">
                  {[
                    { label: "90+", color: "var(--color-success)" },
                    { label: "80-89", color: "var(--color-primary)" },
                    { label: "70-79", color: "var(--color-warning)" },
                    { label: "60-69", color: "var(--color-warning)" },
                    { label: "60미만", color: "var(--color-error)" },
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
                      <div key={label} className="gb-row gb-row-3">
                        <span style={{ fontSize: "var(--text-xs)", width: "48px", textAlign: "right", color: "var(--color-text-tertiary)" }}>
                          {label}
                        </span>
                        <div style={{ flex: 1, height: "16px", background: "var(--color-border-light)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                          <div
                            style={{ height: "100%", background: color, borderRadius: "var(--radius-full)", transition: "all var(--transition-normal)", width: `${percent}%` }}
                          />
                        </div>
                        <span style={{ fontSize: "var(--text-xs)", width: "32px", color: "var(--color-text-tertiary)" }}>
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
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-8) 0" }}>
                <Loader2 style={{ width: 24, height: 24, color: "var(--color-text-disabled)", animation: "spin 1s linear infinite" }} />
              </div>
            ) : testResults.length > 0 ? (
              <div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--color-border-light)" }}>
                      <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)", width: "40%" }}>학생</th>
                      <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)", width: "30%" }}>점수</th>
                      <th style={{ textAlign: "right", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)", width: "30%" }}>등급</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults
                      .sort((a, b) => b.score - a.score)
                      .map((result, idx) => (
                        <tr key={result.studentId} style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                          <td style={{ padding: "var(--space-3)" }}>
                            <div className="gb-row gb-row-2">
                              {idx < 3 && (
                                <Award
                                  style={{ width: 16, height: 16, color: idx === 0 ? "var(--color-warning)" : idx === 1 ? "var(--color-border)" : "var(--color-error)" }}
                                />
                              )}
                              <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>
                                {result.studentName || result.studentId}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>
                            {result.score}점
                          </td>
                          <td style={{ padding: "var(--space-3)", textAlign: "right" }}>
                            <span
                              className={`gb-badge ${result.score >= 90
                                  ? "gb-badge-success"
                                  : result.score >= 80
                                    ? "gb-badge-primary"
                                    : result.score >= 70
                                      ? "gb-badge-warning"
                                      : "gb-badge-error"
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
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="gb-empty-state" style={{ padding: "var(--space-8) 0" }}>
                {selectedTestId
                  ? "시험 결과가 없습니다"
                  : "시험을 선택하세요"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
