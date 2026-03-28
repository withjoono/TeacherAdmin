"use client";

import { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

// Mock 데이터
const mockUploadHistory = [
  {
    id: 1,
    fileName: "수학_중간고사_문제.xlsx",
    uploadDate: "2025-03-15 14:30",
    questionCount: 25,
    status: "성공",
    uploader: "김선생님",
  },
  {
    id: 2,
    fileName: "영어_단어시험.csv",
    uploadDate: "2025-03-14 10:20",
    questionCount: 30,
    status: "성공",
    uploader: "김선생님",
  },
  {
    id: 3,
    fileName: "과학_실험평가.xlsx",
    uploadDate: "2025-03-13 16:45",
    questionCount: 15,
    status: "오류",
    uploader: "김선생님",
  },
];

export default function QuestionUploadPage() {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // 파일 업로드 처리 로직
  };

  return (
    <div className="gb-page-dashboard gb-stack gb-stack-8" style={{ paddingTop: "var(--space-10)" }}>
      {/* 페이지 헤더 */}
      <div className="gb-page-header" style={{ marginBottom: 0 }}>
        <h1 className="gb-page-title">문제 업로드</h1>
        <p className="gb-page-desc">문제 데이터를 엑셀 또는 CSV 형식으로 일괄 업로드하세요</p>
      </div>

      <div className="gb-stack gb-stack-6">
        {/* 가이드 박스 */}
        <div className="gb-grid gb-grid-3">
          <div className="gb-card" style={{ padding: "var(--space-6)", background: "var(--color-primary-50, var(--color-bg-secondary))", borderColor: "color-mix(in srgb, var(--color-primary) 20%, transparent)" }}>
            <FileSpreadsheet style={{ width: 32, height: 32, color: "var(--color-primary)", marginBottom: "var(--space-3)" }} />
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", marginBottom: "var(--space-2)" }}>Excel 형식</h3>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>.xlsx, .xls 파일 지원</p>
          </div>

          <div className="gb-card" style={{ padding: "var(--space-6)", background: "var(--color-success-10)", borderColor: "color-mix(in srgb, var(--color-success) 20%, transparent)" }}>
            <FileText style={{ width: 32, height: 32, color: "var(--color-success)", marginBottom: "var(--space-3)" }} />
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", marginBottom: "var(--space-2)" }}>CSV 형식</h3>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>.csv 파일 지원</p>
          </div>

          <div className="gb-card" style={{ padding: "var(--space-6)", background: "var(--color-warning-10)", borderColor: "color-mix(in srgb, var(--color-warning) 20%, transparent)" }}>
            <Download style={{ width: 32, height: 32, color: "var(--color-warning)", marginBottom: "var(--space-3)" }} />
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", marginBottom: "var(--space-2)" }}>템플릿 다운로드</h3>
            <button className="gb-btn gb-btn-outline" style={{ marginTop: "var(--space-2)", height: "32px", fontSize: "var(--text-xs)" }}>
              템플릿 받기
            </button>
          </div>
        </div>

        {/* 파일 업로드 영역 */}
        <div className="gb-card">
          <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
            파일 업로드
          </h2>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: "2px dashed",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-12) var(--space-6)",
              textAlign: "center",
              transition: "all var(--transition-short)",
              borderColor: isDragging ? "var(--color-primary)" : "var(--color-border)",
              background: isDragging ? "var(--color-primary-50, var(--color-bg-secondary))" : "transparent"
            }}
          >
            <Upload style={{ width: 48, height: 48, margin: "0 auto var(--space-4)", color: "var(--color-text-disabled)" }} />
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", marginBottom: "var(--space-2)" }}>
              파일을 드래그하여 업로드
            </h3>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
              또는 아래 버튼을 클릭하여 파일을 선택하세요
            </p>
            <button className="gb-btn gb-btn-primary" style={{ margin: "0 auto", padding: "0 var(--space-6)" }}>
              <Upload style={{ width: 16, height: 16 }} />
              파일 선택
            </button>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-4)" }}>
              지원 형식: Excel (.xlsx, .xls), CSV (.csv) | 최대 10MB
            </p>
          </div>
        </div>

        {/* 안내사항 */}
        <div className="gb-card">
          <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
            파일 형식 안내
          </h2>
          
          <div className="gb-stack gb-stack-4">
            <div style={{ padding: "var(--space-4)", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-lg)" }}>
              <h4 style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-bold)", marginBottom: "var(--space-2)" }}>필수 컬럼</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }} className="gb-stack gb-stack-1">
                <li style={{ display: "flex", gap: "8px" }}><span style={{ color: "var(--color-primary)" }}>•</span> <strong>문제번호</strong>: 1, 2, 3...</li>
                <li style={{ display: "flex", gap: "8px" }}><span style={{ color: "var(--color-primary)" }}>•</span> <strong>문제내용</strong>: 문제 텍스트</li>
                <li style={{ display: "flex", gap: "8px" }}><span style={{ color: "var(--color-primary)" }}>•</span> <strong>정답</strong>: 정답 (객관식: 1~5, 주관식: 텍스트)</li>
                <li style={{ display: "flex", gap: "8px" }}><span style={{ color: "var(--color-primary)" }}>•</span> <strong>배점</strong>: 점수 (예: 5)</li>
              </ul>
            </div>
            
            <div style={{ padding: "var(--space-4)", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-lg)" }}>
              <h4 style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-bold)", marginBottom: "var(--space-2)" }}>선택 컬럼</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }} className="gb-stack gb-stack-1">
                <li style={{ display: "flex", gap: "8px" }}><span style={{ color: "var(--color-text-tertiary)" }}>•</span> <strong>문제유형</strong>: 객관식, 주관식, 서술형</li>
                <li style={{ display: "flex", gap: "8px" }}><span style={{ color: "var(--color-text-tertiary)" }}>•</span> <strong>난이도</strong>: 상, 중, 하</li>
                <li style={{ display: "flex", gap: "8px" }}><span style={{ color: "var(--color-text-tertiary)" }}>•</span> <strong>선지1~5</strong>: 객관식 선지 (객관식인 경우)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 업로드 히스토리 */}
        <div className="gb-card">
          <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
            업로드 기록
          </h2>
          
          <div className="gb-stack gb-stack-3">
            {mockUploadHistory.map((history) => (
              <div
                key={history.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px",
                  padding: "var(--space-4)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border-light)", transition: "background var(--transition-short)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-bg-secondary)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {history.status === "성공" ? (
                    <CheckCircle2 style={{ width: 32, height: 32, color: "var(--color-success)" }} />
                  ) : (
                    <AlertCircle style={{ width: 32, height: 32, color: "var(--color-error)" }} />
                  )}
                  <div>
                    <p style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-medium)", color: "var(--color-text)" }}>{history.fileName}</p>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
                      {history.uploadDate} | {history.uploader} | {history.questionCount}문항
                    </p>
                  </div>
                </div>
                <div className="gb-row gb-row-3">
                  <span className={`gb-badge ${history.status === "성공" ? "gb-badge-success" : "gb-badge-error"}`}>
                    {history.status}
                  </span>
                  <button className="gb-btn gb-btn-outline" style={{ height: "36px" }}>
                    상세보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
