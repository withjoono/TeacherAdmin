"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { mockExamApi, type MockExam, type CreateQuestionDto } from "@/lib/api";
import type { UploadedQuestion } from "@/types";

const subjectOptions = [
  { value: "국어", label: "국어" },
  { value: "수학", label: "수학" },
  { value: "영어", label: "영어" },
  { value: "탐구1", label: "탐구1" },
  { value: "탐구2", label: "탐구2" },
  { value: "한국사", label: "한국사" },
];

export default function QuestionUploadPage() {
  const { accessToken } = useAuthStore();
  const [exams, setExams] = useState<MockExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [questions, setQuestions] = useState<UploadedQuestion[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

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
    }
  };

  const validateQuestion = (row: Record<string, unknown>): UploadedQuestion => {
    const errors: string[] = [];

    const questionNumber = Number(row["questionNumber"] || row["문제번호"]);
    const answer = Number(row["answer"] || row["정답"]);
    const score = Number(row["score"] || row["배점"] || 2);
    const difficulty = Number(row["difficulty"] || row["난이도"] || 0);
    const correctRate = Number(row["correctRate"] || row["정답률"] || 0);

    if (!questionNumber || questionNumber < 1 || questionNumber > 45) {
      errors.push("문제번호는 1-45 사이여야 합니다");
    }
    if (!answer || answer < 1 || answer > 5) {
      errors.push("정답은 1-5 사이여야 합니다");
    }
    if (score < 1 || score > 4) {
      errors.push("배점은 1-4 사이여야 합니다");
    }

    return {
      questionNumber,
      answer,
      score,
      difficulty,
      correctRate,
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parsedQuestions = jsonData.map((row) =>
          validateQuestion(row as Record<string, unknown>)
        );
        setQuestions(parsedQuestions);
        setUploadResult(null);
      } catch (error) {
        console.error("Failed to parse file:", error);
        setQuestions([]);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!accessToken || !selectedExamId || !selectedSubject) return;

    const validQuestions = questions.filter((q) => q.isValid);
    if (validQuestions.length === 0) {
      setUploadResult({ success: false, message: "유효한 문제가 없습니다." });
      return;
    }

    setIsUploading(true);

    try {
      const questionsToUpload: CreateQuestionDto[] = validQuestions.map((q) => ({
        subject: selectedSubject,
        questionNumber: q.questionNumber,
        answer: q.answer,
        score: q.score,
        difficulty: q.difficulty,
        correctRate: q.correctRate,
      }));

      const result = await mockExamApi.uploadQuestions(
        Number(selectedExamId),
        questionsToUpload,
        accessToken
      );

      setUploadResult({
        success: true,
        message: `${result.count}개의 문제가 성공적으로 등록되었습니다.`,
      });
      setQuestions([]);
    } catch (error) {
      setUploadResult({
        success: false,
        message: "문제 업로드에 실패했습니다.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const validCount = questions.filter((q) => q.isValid).length;
  const invalidCount = questions.filter((q) => !q.isValid).length;

  return (
    <div className="gb-page-dashboard gb-stack gb-stack-8" style={{ paddingTop: "var(--space-10)" }}>
      {/* 페이지 헤더 */}
      <div className="gb-page-header" style={{ marginBottom: 0 }}>
        <h1 className="gb-page-title">문제 대량 업로드</h1>
        <p className="gb-page-desc">시험별 문제를 엑셀 형식으로 일괄 등록하세요</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", alignItems: "start" }}>
        {/* 업로드 설정 */}
        <div className="gb-card gb-stack gb-stack-4" style={{ padding: "var(--space-6)" }}>
          <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
            업로드 설정
          </h2>

          <div>
            <label className="gb-input-label">시험 선택</label>
            <select
              className="gb-input"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
            >
              <option value="" disabled>시험을 선택하세요</option>
              {exams.map(e => (
                <option key={e.id} value={String(e.id)}>{e.code} - {e.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="gb-input-label">과목</label>
            <select
              className="gb-input"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="" disabled>과목을 선택하세요</option>
              {subjectOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div
            {...getRootProps()}
            style={{
              border: "2px dashed",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-8)",
              textAlign: "center",
              cursor: "pointer",
              transition: "all var(--transition-short)",
              borderColor: isDragActive ? "var(--color-primary)" : "var(--color-border)",
              background: isDragActive ? "var(--color-primary-50, var(--color-bg-secondary))" : "transparent"
            }}
          >
            <input {...getInputProps()} />
            <FileSpreadsheet style={{ width: 48, height: 48, margin: "0 auto var(--space-4)", color: "var(--color-text-disabled)" }} />
            {isDragActive ? (
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", fontWeight: "var(--weight-medium)" }}>
                파일을 놓으세요...
              </p>
            ) : (
              <>
                <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>
                  Excel/CSV 파일을 드래그하거나 클릭하여 선택
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
                  .xlsx, .xls, .csv 파일 지원
                </p>
              </>
            )}
          </div>

          <div style={{ padding: "var(--space-4)", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }}>
            <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-bold)", marginBottom: "var(--space-1)" }}>엑셀 템플릿 형식:</p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", fontFamily: "monospace", opacity: 0.8 }}>
              questionNumber | answer | score | difficulty | correctRate
            </p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-1)" }}>
              또는: 문제번호 | 정답 | 배점 | 난이도 | 정답률
            </p>
          </div>
        </div>

        {/* 엑셀 파일 파싱 미리보기 */}
        <div className="gb-card" style={{ padding: "var(--space-6)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
            <h2 className="gb-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
              <FileText style={{ width: 18, height: 18, color: 'var(--color-primary)' }}/>
              미리보기
            </h2>
            {questions.length > 0 && (
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
                유효: <span style={{ color: "var(--color-success)", fontWeight: "bold" }}>{validCount}</span>개 / 오류: <span style={{ color: "var(--color-error)", fontWeight: "bold" }}>{invalidCount}</span>개
              </span>
            )}
          </div>

          {questions.length === 0 ? (
            <div className="gb-empty-state" style={{ padding: "var(--space-12) 0" }}>
              파일을 업로드하면 미리보기가 표시됩니다.
            </div>
          ) : (
            <>
              <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid var(--color-border-light)", borderRadius: "var(--radius-md)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ position: "sticky", top: 0, background: "var(--color-bg-light)" }}>
                    <tr style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", borderBottom: "1px solid var(--color-border-light)" }}>
                      <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>번호</th>
                      <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>정답</th>
                      <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>배점</th>
                      <th style={{ textAlign: "left", padding: "var(--space-3)", fontWeight: "var(--weight-semibold)" }}>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--color-border-light)", background: "white" }}>
                        <td style={{ padding: "var(--space-3)", fontSize: "var(--text-sm)" }}>{q.questionNumber}</td>
                        <td style={{ padding: "var(--space-3)", fontSize: "var(--text-sm)" }}>{q.answer}</td>
                        <td style={{ padding: "var(--space-3)", fontSize: "var(--text-sm)" }}>{q.score}</td>
                        <td style={{ padding: "var(--space-3)", fontSize: "var(--text-sm)" }}>
                          {q.isValid ? (
                            <CheckCircle style={{ width: 16, height: 16, color: "var(--color-success)" }} />
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-error)" }}>
                              <AlertCircle style={{ width: 16, height: 16 }} />
                              <span style={{ fontSize: "10px" }}>{q.errors?.join(", ")}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {uploadResult && (
                <div style={{ marginTop: "var(--space-4)", padding: "var(--space-3)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)",
                  background: uploadResult.success ? "var(--color-success-10)" : "var(--color-error-10)",
                  color: uploadResult.success ? "var(--color-success)" : "var(--color-error)"
                }}>
                  {uploadResult.message}
                </div>
              )}

              <button
                className="gb-btn gb-btn-primary"
                style={{ width: "100%", marginTop: "var(--space-6)", justifyContent: "center" }}
                onClick={handleUpload}
                disabled={!selectedExamId || !selectedSubject || validCount === 0 || isUploading}
              >
                <Upload style={{ width: 16, height: 16 }} />
                {isUploading ? "업로드 중..." : `${validCount}개 문제 업로드`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
