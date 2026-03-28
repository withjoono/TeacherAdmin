"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, FileText } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { mockExamApi, type MockExam } from "@/lib/api";

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
    <div className="gb-page-dashboard gb-stack gb-stack-8" style={{ paddingTop: "var(--space-10)" }}>
      {/* 페이지 헤더 */}
      <div className="gb-page-header" style={{ marginBottom: 0 }}>
        <h1 className="gb-page-title">시험 관리</h1>
        <p className="gb-page-desc">출제된 시험 목록을 조회하고 새 시험을 생성하세요</p>
      </div>

      <div className="gb-card">
        <div className="gb-row gb-row-4" style={{ justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
          <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
            <FileText style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
            시험 목록
          </h2>
          <Link href="/exams/new" style={{ textDecoration: 'none' }}>
            <button className="gb-btn gb-btn-primary">
              <Plus style={{ width: 16, height: 16 }} />
              새 시험 생성
            </button>
          </Link>
        </div>

        <div style={{ marginBottom: "var(--space-6)", position: "relative", maxWidth: "400px" }}>
          <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--color-text-tertiary)" }} />
          <input
            type="text"
            placeholder="시험 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="gb-input"
            style={{ paddingLeft: "36px" }}
          />
        </div>

        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-8) 0" }}>
            <div style={{ width: 24, height: 24, border: "2px solid var(--color-border)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="gb-empty-state" style={{ padding: "var(--space-8) 0" }}>
            {searchQuery
              ? "검색 결과가 없습니다."
              : "등록된 시험이 없습니다. 새 시험을 생성해주세요."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--color-border-light)" }}>
                  <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>코드</th>
                  <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>시험명</th>
                  <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>학년</th>
                  <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>년도</th>
                  <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>월</th>
                  <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>유형</th>
                  <th style={{ textAlign: "right", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam.id} style={{ borderBottom: "1px solid var(--color-border-light)", transition: "background var(--transition-short)" }}>
                    <td style={{ padding: "var(--space-3)", fontFamily: "monospace", color: "var(--color-text-secondary)" }}>{exam.code}</td>
                    <td style={{ padding: "var(--space-3)", fontWeight: "var(--weight-medium)" }}>{exam.name}</td>
                    <td style={{ padding: "var(--space-3)", color: "var(--color-text-secondary)" }}>{exam.grade}</td>
                    <td style={{ padding: "var(--space-3)", color: "var(--color-text-secondary)" }}>{exam.year}</td>
                    <td style={{ padding: "var(--space-3)", color: "var(--color-text-secondary)" }}>{exam.month}월</td>
                    <td style={{ padding: "var(--space-3)" }}>
                      <span className="gb-badge gb-badge-primary">{exam.type}</span>
                    </td>
                    <td style={{ padding: "var(--space-3)", textAlign: "right" }}>
                      <div className="gb-row gb-row-1" style={{ justifyContent: "flex-end" }}>
                        <Link href={`/exams/${exam.id}`}>
                          <button style={{ padding: "var(--space-2)", borderRadius: "var(--radius-sm)", color: "var(--color-text-secondary)", background: "transparent", border: "1px solid var(--color-border)", cursor: "pointer" }}>
                            <Pencil style={{ width: 14, height: 14 }} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          style={{ padding: "var(--space-2)", borderRadius: "var(--radius-sm)", color: "var(--color-error)", background: "var(--color-error-10)", border: "none", cursor: "pointer" }}
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
