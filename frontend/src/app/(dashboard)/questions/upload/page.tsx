"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth";
import { mockExamApi, type MockExam, type CreateQuestionDto } from "@/lib/api";
import type { UploadedQuestion } from "@/types";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

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

  const examOptions = exams.map((e) => ({
    value: String(e.id),
    label: `${e.code} - ${e.name}`,
  }));

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="문제 대량 업로드"
        description="시험별 문제를 엑셀 형식으로 일괄 등록하세요."
      />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* 업로드 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              업로드 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>시험 선택</Label>
              <Select
                options={examOptions}
                placeholder="시험을 선택하세요"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>과목</Label>
              <Select
                options={subjectOptions}
                placeholder="과목을 선택하세요"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              />
            </div>

            <div
              {...getRootProps()}
              className={cn(
                "cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
                isDragActive ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              {isDragActive ? (
                <p className="text-sm font-medium text-muted-foreground">
                  파일을 놓으세요...
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">
                    Excel/CSV 파일을 드래그하거나 클릭하여 선택
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    .xlsx, .xls, .csv 파일 지원
                  </p>
                </>
              )}
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="mb-1 text-sm font-bold text-foreground">
                엑셀 템플릿 형식:
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                questionNumber | answer | score | difficulty | correctRate
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                또는: 문제번호 | 정답 | 배점 | 난이도 | 정답률
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 미리보기 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                미리보기
              </CardTitle>
              {questions.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  유효:{" "}
                  <span className="font-bold text-emerald-600">
                    {validCount}
                  </span>
                  개 / 오류:{" "}
                  <span className="font-bold text-rose-600">
                    {invalidCount}
                  </span>
                  개
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="미리보기가 없습니다"
                description="파일을 업로드하면 미리보기가 표시됩니다."
              />
            ) : (
              <>
                <div className="max-h-[400px] overflow-y-auto rounded-lg border">
                  <Table>
                    <TableHeader className="sticky top-0 bg-muted">
                      <TableRow>
                        <TableHead>번호</TableHead>
                        <TableHead>정답</TableHead>
                        <TableHead>배점</TableHead>
                        <TableHead>상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((q, i) => (
                        <TableRow key={i}>
                          <TableCell>{q.questionNumber}</TableCell>
                          <TableCell>{q.answer}</TableCell>
                          <TableCell>{q.score}</TableCell>
                          <TableCell>
                            {q.isValid ? (
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <div className="flex items-center gap-1 text-rose-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-[10px]">
                                  {q.errors?.join(", ")}
                                </span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {uploadResult && (
                  <div
                    className={cn(
                      "mt-4 rounded-md p-3 text-sm font-medium",
                      uploadResult.success
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    )}
                  >
                    {uploadResult.message}
                  </div>
                )}

                <Button
                  className="mt-6 w-full"
                  onClick={handleUpload}
                  disabled={
                    !selectedExamId ||
                    !selectedSubject ||
                    validCount === 0 ||
                    isUploading
                  }
                >
                  <Upload className="h-4 w-4" />
                  {isUploading
                    ? "업로드 중..."
                    : `${validCount}개 문제 업로드`}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
