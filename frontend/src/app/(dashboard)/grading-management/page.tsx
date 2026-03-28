"use client";

import { useState } from "react";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  FileText,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";

// Mock 데이터
const mockGradingTasks = [
  {
    id: 1,
    examTitle: "3월 중간고사",
    subject: "수학",
    class: "A반",
    totalStudents: 12,
    gradedCount: 8,
    pendingCount: 4,
    dueDate: "2025-03-20",
    status: "진행중",
  },
  {
    id: 2,
    examTitle: "영어 쪽지시험 #1",
    subject: "영어",
    class: "B반",
    totalStudents: 15,
    gradedCount: 0,
    pendingCount: 15,
    dueDate: "2025-03-22",
    status: "대기",
  },
  {
    id: 3,
    examTitle: "과학 실험평가",
    subject: "과학",
    class: "A반",
    totalStudents: 12,
    gradedCount: 12,
    pendingCount: 0,
    dueDate: "2025-03-18",
    status: "완료",
  },
];

const mockGradedExams = [
  {
    id: 1,
    examTitle: "2월 기말고사",
    subject: "수학",
    class: "A반",
    completedDate: "2025-02-28",
    totalStudents: 12,
    avgScore: 82.5,
    highScore: 98,
    lowScore: 65,
  },
  {
    id: 2,
    examTitle: "영어 단어시험",
    subject: "영어",
    class: "B반",
    completedDate: "2025-02-25",
    totalStudents: 15,
    avgScore: 88.3,
    highScore: 100,
    lowScore: 72,
  },
];

export default function GradingManagementPage() {
  const [activeTab, setActiveTab] = useState("pending"); // "pending", "completed"

  return (
    <div className="gb-page-dashboard gb-stack gb-stack-8" style={{ paddingTop: "var(--space-10)" }}>
      {/* 페이지 헤더 */}
      <div className="gb-page-header" style={{ marginBottom: 0 }}>
        <h1 className="gb-page-title">채점 관리</h1>
        <p className="gb-page-desc">제출된 시험/과제 채점 현황을 확인하고 관리하세요</p>
      </div>

      <div className="gb-stack gb-stack-6">
        {/* 통계 카드 */}
        <div className="gb-grid gb-grid-4">
          <div className="gb-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-6)" }}>
            <div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-1)" }}>대기 중</p>
              <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-warning)" }}>
                {mockGradingTasks.filter((t) => t.status === "대기").length}
              </h3>
            </div>
            <Clock style={{ width: 32, height: 32, color: "var(--color-warning)" }} />
          </div>

          <div className="gb-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-6)" }}>
            <div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-1)" }}>진행 중</p>
              <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-primary)" }}>
                {mockGradingTasks.filter((t) => t.status === "진행중").length}
              </h3>
            </div>
            <CheckSquare style={{ width: 32, height: 32, color: "var(--color-primary)" }} />
          </div>

          <div className="gb-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-6)" }}>
            <div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-1)" }}>완료</p>
              <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-success)" }}>
                {mockGradingTasks.filter((t) => t.status === "완료").length}
              </h3>
            </div>
            <CheckCircle2 style={{ width: 32, height: 32, color: "var(--color-success)" }} />
          </div>

          <div className="gb-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-6)" }}>
            <div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-1)" }}>미채점 답안</p>
              <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-error)" }}>
                {mockGradingTasks.reduce((sum, t) => sum + t.pendingCount, 0)}
              </h3>
            </div>
            <FileText style={{ width: 32, height: 32, color: "var(--color-error)" }} />
          </div>
        </div>

        {/* 탭 헤더 */}
        <div style={{ display: "flex", gap: "var(--space-6)", borderBottom: "1px solid var(--color-border-light)" }}>
            {[
                { id: "pending", icon: Clock, label: "채점 대기 목록" },
                { id: "completed", icon: CheckCircle2, label: "채점 완료 목록" }
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

        {/* 관리 탭 컨텐츠 */}
        <div className="gb-card">
          {activeTab === "pending" && (
            <div>
              <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
                채점이 필요한 시험
              </h2>
              
              {mockGradingTasks.filter((task) => task.status !== "완료").length > 0 ? (
                <div className="gb-stack gb-stack-4">
                  {mockGradingTasks
                    .filter((task) => task.status !== "완료")
                    .map((task) => (
                      <div
                        key={task.id}
                        style={{
                          padding: "var(--space-4)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border-light)", transition: "background var(--transition-short)"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-bg-secondary)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                          <div>
                            <div className="gb-row gb-row-2">
                              <p style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>{task.examTitle}</p>
                              <span className={`gb-badge ${task.status === "진행중" ? "gb-badge-primary" : "gb-badge-warning"}`}>
                                {task.status}
                              </span>
                            </div>
                            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginTop: "var(--space-1)" }}>
                              {task.subject} | {task.class} | 마감: {task.dueDate}
                            </p>
                          </div>
                          <button className="gb-btn gb-btn-primary">채점 시작</button>
                        </div>

                        <div className="gb-grid gb-grid-3" style={{ marginBottom: "var(--space-4)" }}>
                          <div style={{ background: "var(--color-primary-50, var(--color-bg-secondary))", padding: "var(--space-3)", borderRadius: "var(--radius-md)" }}>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-1)" }}>전체 학생</p>
                            <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-bold)", color: "var(--color-primary)" }}>{task.totalStudents}명</p>
                          </div>
                          <div style={{ background: "var(--color-success-10)", padding: "var(--space-3)", borderRadius: "var(--radius-md)" }}>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-1)" }}>채점 완료</p>
                            <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-bold)", color: "var(--color-success)" }}>{task.gradedCount}명</p>
                          </div>
                          <div style={{ background: "var(--color-warning-10)", padding: "var(--space-3)", borderRadius: "var(--radius-md)" }}>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-1)" }}>채점 대기</p>
                            <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-bold)", color: "var(--color-warning)" }}>{task.pendingCount}명</p>
                          </div>
                        </div>

                        {task.status === "진행중" && (
                          <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--text-xs)", marginBottom: "var(--space-1)" }}>
                              <span style={{ color: "var(--color-text-tertiary)" }}>진행률</span>
                              <span style={{ fontWeight: "var(--weight-medium)" }}>{Math.round((task.gradedCount / task.totalStudents) * 100)}%</span>
                            </div>
                            <div style={{ height: "8px", background: "var(--color-border-light)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                              <div
                                style={{
                                  height: "100%", background: "var(--color-primary)", borderRadius: "var(--radius-full)", transition: "all var(--transition-normal)",
                                  width: `${(task.gradedCount / task.totalStudents) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="gb-empty-state" style={{ padding: "var(--space-8) 0" }}>
                  대기 중인 채점이 없습니다
                </div>
              )}
            </div>
          )}

          {activeTab === "completed" && (
            <div>
              <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: 18, height: 18, color: 'var(--color-success)' }}/>
                채점 완료된 시험
              </h2>

              {mockGradedExams.length > 0 ? (
                <div className="gb-stack gb-stack-4">
                  {mockGradedExams.map((exam) => (
                    <div
                      key={exam.id}
                      style={{
                        padding: "var(--space-4)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border-light)", transition: "background var(--transition-short)"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-bg-secondary)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                        <div>
                          <div className="gb-row gb-row-2">
                            <CheckCircle2 style={{ width: 18, height: 18, color: "var(--color-success)" }} />
                            <p style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>{exam.examTitle}</p>
                          </div>
                          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginTop: "var(--space-1)" }}>
                            {exam.subject} | {exam.class} | 완료일: {exam.completedDate}
                          </p>
                        </div>
                        <div className="gb-row gb-row-2">
                          <button className="gb-btn gb-btn-outline" style={{ height: "36px", padding: "0 var(--space-3)", fontSize: "var(--text-sm)" }}>
                            <TrendingUp style={{ width: 16, height: 16 }} />
                            통계 보기
                          </button>
                          <button className="gb-btn gb-btn-outline" style={{ height: "36px", padding: "0 var(--space-3)", fontSize: "var(--text-sm)" }}>
                            상세보기
                          </button>
                        </div>
                      </div>

                      <div className="gb-grid gb-grid-4">
                        <div style={{ background: "var(--color-primary-50, var(--color-bg-secondary))", padding: "var(--space-3)", borderRadius: "var(--radius-md)" }}>
                          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-1)" }}>응시 인원</p>
                          <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-bold)", color: "var(--color-primary)" }}>{exam.totalStudents}명</p>
                        </div>
                        <div style={{ background: "var(--color-success-10)", padding: "var(--space-3)", borderRadius: "var(--radius-md)" }}>
                          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-1)" }}>평균 점수</p>
                          <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-bold)", color: "var(--color-success)" }}>{exam.avgScore}점</p>
                        </div>
                        <div style={{ background: "var(--color-warning-10)", padding: "var(--space-3)", borderRadius: "var(--radius-md)" }}>
                          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-1)" }}>최고 점수</p>
                          <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-bold)", color: "var(--color-warning)" }}>{exam.highScore}점</p>
                        </div>
                        <div style={{ background: "var(--color-error-10)", padding: "var(--space-3)", borderRadius: "var(--radius-md)" }}>
                          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-1)" }}>최저 점수</p>
                          <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-bold)", color: "var(--color-error)" }}>{exam.lowScore}점</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="gb-empty-state" style={{ padding: "var(--space-8) 0" }}>
                  채점 완료된 시험이 없습니다
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
