"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    ClipboardList,
    FileText,
    Users,
    Loader2,
    CheckCircle2,
    Save,
    Calendar,
    Eye,
    MessageSquare,
    X,
} from "lucide-react";
import { getMyArenaClasses } from "@/lib/api/classes";
import type { ArenaClass } from "@/lib/api/classes";
import {
    getLessonPlans,
    createAssignment,
    getAssignmentSubmissions,
    gradeSubmission,
} from "@/lib/api/teacher";
import type { LessonPlan, AssignmentSubmission } from "@/lib/api/teacher";

// ================================
// 메인 페이지
// ================================
export default function AssignmentManagementPage() {
    const [classes, setClasses] = useState<ArenaClass[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("create"); // "create", "submissions", "grade"

    // 과제 출제
    const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
    const [selectedLessonId, setSelectedLessonId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [creating, setCreating] = useState(false);
    const [created, setCreated] = useState(false);
    const [createdAssignments, setCreatedAssignments] = useState<any[]>([]);

    // 제출 현황
    const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
    const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);

    // 채점 다이얼로그 UI 상태
    const [gradeDialog, setGradeDialog] = useState<AssignmentSubmission | null>(null);
    const [gradeScore, setGradeScore] = useState("");
    const [gradeFeedback, setGradeFeedback] = useState("");
    const [grading, setGrading] = useState(false);

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

    // 수업 계획 로드
    useEffect(() => {
        if (!selectedClassId) return;
        async function fetchPlans() {
            try {
                const data = await getLessonPlans(selectedClassId);
                setLessonPlans(data || []);
                if (data && data.length > 0) {
                    setSelectedLessonId(data[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch plans:", err);
            }
        }
        fetchPlans();
    }, [selectedClassId]);

    // 과제 출제
    const handleCreate = async () => {
        if (!selectedClassId || !title.trim()) return;
        try {
            setCreating(true);
            const result = await createAssignment(selectedClassId, {
                lessonId: selectedLessonId || undefined,
                title: title.trim(),
                description: description.trim() || undefined,
                dueDate: dueDate || undefined,
            });
            setCreatedAssignments((prev) => [...prev, result]);
            setCreated(true);
            setTitle("");
            setDescription("");
            setDueDate("");
            setTimeout(() => setCreated(false), 3000);
        } catch (err) {
            console.error("Failed to create assignment:", err);
            alert("과제 생성에 실패했습니다.");
        } finally {
            setCreating(false);
        }
    };

    // 제출 현황 조회
    const fetchSubmissions = async (assignmentId: string) => {
        if (!selectedClassId || !assignmentId) return;
        try {
            setSubmissionsLoading(true);
            const data = await getAssignmentSubmissions(selectedClassId, assignmentId);
            setSubmissions(data || []);
        } catch (err) {
            console.error("Failed to fetch submissions:", err);
            setSubmissions([]);
        } finally {
            setSubmissionsLoading(false);
        }
    };

    // 채점
    const handleGrade = async () => {
        if (!gradeDialog || !selectedClassId || !selectedAssignmentId) return;
        try {
            setGrading(true);
            await gradeSubmission(selectedClassId, selectedAssignmentId, gradeDialog.id, {
                score: Number(gradeScore) || 0,
                feedback: gradeFeedback.trim() || undefined,
            });
            setGradeDialog(null);
            setGradeScore("");
            setGradeFeedback("");
            fetchSubmissions(selectedAssignmentId);
        } catch (err) {
            console.error("Failed to grade:", err);
            alert("채점에 실패했습니다.");
        } finally {
            setGrading(false);
        }
    };

    // 통계
    const submittedCount = submissions.filter((s) => s.submittedAt).length;
    const gradedCount = submissions.filter((s) => s.score !== undefined && s.score !== null).length;

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
                <h1 className="gb-page-title">과제 관리</h1>
                <p className="gb-page-desc">
                    학생들에게 과제를 출제하고 제출된 과제를 채점하세요
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
                    </div>
                </div>

                {/* 탭 헤더 */}
                <div style={{ display: "flex", gap: "var(--space-6)", borderBottom: "1px solid var(--color-border-light)" }}>
                    {[
                        { id: "create", icon: Plus, label: "과제 출제" },
                        { id: "submissions", icon: Eye, label: "제출 현황" },
                        { id: "grade", icon: FileText, label: "채점" },
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

                {/* 과제 출제 */}
                {activeTab === "create" && (
                    <div className="gb-card">
                        <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ClipboardList style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
                            새 과제 출제
                        </h2>
                        <div className="gb-stack gb-stack-4" style={{ maxWidth: '600px' }}>
                            {created && (
                                <div style={{ padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--color-success-10)", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-success)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>
                                    <CheckCircle2 style={{ width: 16, height: 16 }} />
                                    과제가 생성되었습니다!
                                </div>
                            )}

                            <div>
                                <label className="gb-input-label">연결할 수업 계획 (선택)</label>
                                <select
                                    value={selectedLessonId}
                                    onChange={(e) => setSelectedLessonId(e.target.value)}
                                    className="gb-input"
                                >
                                    <option value="">없음</option>
                                    {lessonPlans.map((plan) => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="gb-input-label">과제 제목 <span style={{ color: "var(--color-error)" }}>*</span></label>
                                <input
                                    type="text"
                                    className="gb-input"
                                    placeholder="예: 3단원 연습문제"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="gb-input-label">설명</label>
                                <textarea
                                    className="gb-input"
                                    placeholder="과제 내용을 설명하세요..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    style={{ resize: "none" }}
                                />
                            </div>

                            <div>
                                <label className="gb-input-label" style={{ display: "flex", alignItems: "center" }}>
                                    <Calendar style={{ width: 14, height: 14, marginRight: "4px" }} />
                                    마감일
                                </label>
                                <input
                                    type="date"
                                    className="gb-input"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>

                            <button
                                className="gb-btn gb-btn-primary"
                                style={{ width: "100%", justifyContent: "center", marginTop: "var(--space-4)" }}
                                onClick={handleCreate}
                                disabled={creating || !title.trim()}
                            >
                                {creating ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Plus style={{ width: 16, height: 16 }} />}
                                과제 출제
                            </button>
                        </div>

                        {createdAssignments.length > 0 && (
                            <div className="gb-stack gb-stack-2" style={{ marginTop: "var(--space-8)" }}>
                                <h4 style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-tertiary)" }}>
                                    출제된 과제
                                </h4>
                                {createdAssignments.map((a, i) => (
                                    <div key={i} className="gb-row gb-row-2" style={{ padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--color-primary-50, var(--color-bg-secondary))", border: "1px solid var(--color-border-light)", fontSize: "var(--text-sm)" }}>
                                        <ClipboardList style={{ width: 16, height: 16, color: "var(--color-primary)" }} />
                                        <span style={{ flex: 1 }}>{a.title || a.id}</span>
                                        {a.dueDate && (
                                            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
                                                마감: {a.dueDate.split("T")[0]}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 제출 현황 */}
                {activeTab === "submissions" && (
                    <div className="gb-card">
                        <div className="gb-row gb-row-4" style={{ justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
                            <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
                                <Eye style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
                                제출 현황
                            </h2>
                            <select
                                value={selectedAssignmentId}
                                onChange={(e) => {
                                    setSelectedAssignmentId(e.target.value);
                                    if (e.target.value) fetchSubmissions(e.target.value);
                                }}
                                className="gb-input"
                                style={{ width: "240px" }}
                            >
                                <option value="">과제 선택</option>
                                {createdAssignments.map((a, i) => (
                                    <option key={i} value={a.id}>
                                        {a.title || `과제 ${i + 1}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 통계 */}
                        {submissions.length > 0 && (
                            <div className="gb-grid gb-grid-3" style={{ marginBottom: "var(--space-6)" }}>
                                <div style={{ background: "var(--color-primary-50, var(--color-bg-secondary))", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
                                    <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-primary)" }}>
                                        {submissions.length}
                                    </div>
                                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-1)" }}>전체</div>
                                </div>
                                <div style={{ background: "var(--color-success-10)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
                                    <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-success)" }}>
                                        {submittedCount}
                                    </div>
                                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-1)" }}>제출</div>
                                </div>
                                <div style={{ background: "var(--color-warning-10)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
                                    <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-warning)" }}>
                                        {submissions.length - submittedCount}
                                    </div>
                                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-1)" }}>미제출</div>
                                </div>
                            </div>
                        )}

                        {submissionsLoading ? (
                            <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-8) 0" }}>
                                <Loader2 style={{ width: 24, height: 24, color: "var(--color-text-disabled)", animation: "spin 1s linear infinite" }} />
                            </div>
                        ) : submissions.length > 0 ? (
                            <div>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--color-border-light)" }}>
                                            <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>학생</th>
                                            <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>제출 상태</th>
                                            <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>제출일</th>
                                            <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>점수</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.map((sub) => (
                                            <tr key={sub.id} style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                                                <td style={{ padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>
                                                    {sub.studentName || sub.studentId}
                                                </td>
                                                <td style={{ padding: "var(--space-3)" }}>
                                                    <span className={`gb-badge ${sub.submittedAt ? "gb-badge-success" : ""}`} style={{ background: !sub.submittedAt ? "var(--color-bg-secondary)" : undefined, color: !sub.submittedAt ? "var(--color-text-tertiary)" : undefined }}>
                                                        {sub.submittedAt ? "제출완료" : "미제출"}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "var(--space-3)", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
                                                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString("ko-KR") : "—"}
                                                </td>
                                                <td style={{ padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>
                                                    {sub.score !== undefined && sub.score !== null ? `${sub.score}점` : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="gb-empty-state" style={{ padding: "var(--space-8) 0" }}>
                                {selectedAssignmentId
                                    ? "제출 기록이 없습니다"
                                    : "과제를 선택하세요"}
                            </div>
                        )}
                    </div>
                )}

                {/* 채점 */}
                {activeTab === "grade" && (
                    <div className="gb-card">
                        <div className="gb-row gb-row-4" style={{ justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
                            <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
                                <FileText style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
                                채점
                            </h2>
                            <select
                                value={selectedAssignmentId}
                                onChange={(e) => {
                                    setSelectedAssignmentId(e.target.value);
                                    if (e.target.value) fetchSubmissions(e.target.value);
                                }}
                                className="gb-input"
                                style={{ width: "240px" }}
                            >
                                <option value="">과제 선택</option>
                                {createdAssignments.map((a, i) => (
                                    <option key={i} value={a.id}>
                                        {a.title || `과제 ${i + 1}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {submissions.length > 0 && (
                            <div style={{ marginBottom: "var(--space-6)", padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-md)", background: "var(--color-primary-50, var(--color-bg-secondary))", fontSize: "var(--text-sm)" }}>
                                전체 {submissions.length}명 중{" "}
                                <span style={{ fontWeight: "var(--weight-bold)", color: "var(--color-success)" }}>{gradedCount}명</span>{" "}
                                채점 완료,{" "}
                                <span style={{ fontWeight: "var(--weight-bold)", color: "var(--color-warning)" }}>
                                    {submittedCount - gradedCount}명
                                </span>{" "}
                                채점 대기
                            </div>
                        )}

                        {submissionsLoading ? (
                            <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-8) 0" }}>
                                <Loader2 style={{ width: 24, height: 24, color: "var(--color-text-disabled)", animation: "spin 1s linear infinite" }} />
                            </div>
                        ) : submissions.filter((s) => s.submittedAt).length > 0 ? (
                            <div className="gb-stack gb-stack-3">
                                {submissions
                                    .filter((s) => s.submittedAt)
                                    .map((sub) => (
                                        <div
                                            key={sub.id}
                                            style={{ padding: "var(--space-4)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border-light)", transition: "background var(--transition-short)" }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-bg-secondary)"}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <div>
                                                    <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "var(--color-text)" }}>
                                                        {sub.studentName || sub.studentId}
                                                    </div>
                                                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-1)" }}>
                                                        제출: {new Date(sub.submittedAt!).toLocaleString("ko-KR")}
                                                    </div>
                                                </div>
                                                <div>
                                                    {sub.score !== undefined && sub.score !== null ? (
                                                        <span className="gb-badge gb-badge-success" style={{ padding: "4px 10px", fontSize: "var(--text-sm)" }}>
                                                            {sub.score}점
                                                        </span>
                                                    ) : (
                                                        <button
                                                            className="gb-btn gb-btn-primary"
                                                            style={{ height: "32px", padding: "0 var(--space-3)", fontSize: "var(--text-sm)" }}
                                                            onClick={() => {
                                                                setGradeDialog(sub);
                                                                setGradeScore("");
                                                                setGradeFeedback("");
                                                            }}
                                                        >
                                                            <MessageSquare style={{ width: 14, height: 14 }} />
                                                            채점
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {sub.feedback && (
                                                <div style={{ marginTop: "var(--space-3)", padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--color-primary-50, var(--color-bg-secondary))", fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                                                    💬 {sub.feedback}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="gb-empty-state" style={{ padding: "var(--space-8) 0" }}>
                                {selectedAssignmentId
                                    ? "제출된 과제가 없습니다"
                                    : "과제를 선택하세요"}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 채점 다이얼로그 */}
            {gradeDialog && (
                <div className="gb-modal-overlay">
                    <div className="gb-modal">
                        <div className="gb-row" style={{ justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
                            <h2 className="gb-modal-title" style={{ marginBottom: 0 }}>
                                {gradeDialog.studentName || gradeDialog.studentId} 채점
                            </h2>
                            <button className="gb-header-icon-btn" onClick={() => setGradeDialog(null)}>
                                <X style={{ width: 16, height: 16 }} />
                            </button>
                        </div>
                        
                        <div className="gb-stack gb-stack-4">
                            <div>
                                <label className="gb-input-label">점수</label>
                                <input
                                    type="number"
                                    className="gb-input"
                                    placeholder="점수 입력"
                                    value={gradeScore}
                                    onChange={(e) => setGradeScore(e.target.value)}
                                    min={0}
                                />
                            </div>
                            <div>
                                <label className="gb-input-label">피드백</label>
                                <textarea
                                    placeholder="학생에게 전달할 피드백을 작성하세요..."
                                    value={gradeFeedback}
                                    onChange={(e) => setGradeFeedback(e.target.value)}
                                    rows={3}
                                    className="gb-input"
                                    style={{ resize: "none" }}
                                />
                            </div>
                        </div>
                        
                        <div className="gb-modal-actions" style={{ marginTop: "var(--space-6)", justifyContent: "flex-end" }}>
                            <button className="gb-btn gb-btn-secondary" onClick={() => setGradeDialog(null)}>취소</button>
                            <button
                                className="gb-btn gb-btn-primary"
                                onClick={handleGrade}
                                disabled={grading || !gradeScore}
                            >
                                {grading ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : null}
                                채점 완료
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
