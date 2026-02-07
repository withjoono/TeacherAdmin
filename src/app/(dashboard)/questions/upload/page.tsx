"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  const examOptions = exams.map((e) => ({
    value: String(e.id),
    label: `${e.code} - ${e.name}`,
  }));

  return (
    <div className="flex flex-col">
      <Header title="문제 업로드" />

      <div className="flex-1 p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>업로드 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">시험 선택</label>
                <Select
                  options={examOptions}
                  placeholder="시험을 선택하세요"
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">과목</label>
                <Select
                  options={subjectOptions}
                  placeholder="과목을 선택하세요"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                />
              </div>

              <div
                {...getRootProps()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary"
                }`}
              >
                <input {...getInputProps()} />
                <FileSpreadsheet className="mb-4 h-12 w-12 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-sm text-muted-foreground">
                    파일을 놓으세요...
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-medium">
                      Excel/CSV 파일을 드래그하거나 클릭하여 선택
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      .xlsx, .xls, .csv 파일 지원
                    </p>
                  </>
                )}
              </div>

              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium">엑셀 템플릿 형식:</p>
                <p className="mt-1 text-muted-foreground">
                  questionNumber | answer | score | difficulty | correctRate
                </p>
                <p className="text-muted-foreground">
                  또는: 문제번호 | 정답 | 배점 | 난이도 | 정답률
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>미리보기</span>
                {questions.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    유효: {validCount}개 / 오류: {invalidCount}개
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  파일을 업로드하면 미리보기가 표시됩니다.
                </div>
              ) : (
                <>
                  <div className="max-h-96 overflow-auto">
                    <Table>
                      <TableHeader>
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
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <div className="flex items-center gap-1 text-destructive">
                                  <AlertCircle className="h-4 w-4" />
                                  <span className="text-xs">
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
                      className={`mt-4 rounded-md p-3 text-sm ${
                        uploadResult.success
                          ? "bg-green-500/10 text-green-600"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {uploadResult.message}
                    </div>
                  )}

                  <Button
                    className="mt-4 w-full"
                    onClick={handleUpload}
                    disabled={
                      !selectedExamId ||
                      !selectedSubject ||
                      validCount === 0 ||
                      isUploading
                    }
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading
                      ? "업로드 중..."
                      : `${validCount}개 문제 업로드`}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
