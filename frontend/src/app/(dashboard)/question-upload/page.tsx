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
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <PageContainer className="space-y-6">
      <PageHeader
        title="문제 업로드"
        description="문제 데이터를 엑셀 또는 CSV 형식으로 일괄 업로드하세요."
      />

      {/* 가이드 카드 */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h3 className="mb-1 text-base font-semibold text-foreground">
              Excel 형식
            </h3>
            <p className="text-sm text-muted-foreground">.xlsx, .xls 파일 지원</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="mb-1 text-base font-semibold text-foreground">
              CSV 형식
            </h3>
            <p className="text-sm text-muted-foreground">.csv 파일 지원</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Download className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-base font-semibold text-foreground">
              템플릿 다운로드
            </h3>
            <Button variant="outline" size="sm">
              템플릿 받기
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* 파일 업로드 영역 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            파일 업로드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
              isDragging ? "border-primary bg-primary/5" : "border-border"
            )}
          >
            <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-1 text-lg font-semibold text-foreground">
              파일을 드래그하여 업로드
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              또는 아래 버튼을 클릭하여 파일을 선택하세요
            </p>
            <Button>
              <Upload className="h-4 w-4" />
              파일 선택
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">
              지원 형식: Excel (.xlsx, .xls), CSV (.csv) | 최대 10MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 안내사항 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            파일 형식 안내
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h4 className="mb-2 text-sm font-bold text-foreground">필수 컬럼</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong className="text-foreground">문제번호</strong>: 1, 2, 3...
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong className="text-foreground">문제내용</strong>: 문제 텍스트
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong className="text-foreground">정답</strong>: 정답 (객관식:
                  1~5, 주관식: 텍스트)
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong className="text-foreground">배점</strong>: 점수 (예: 5)
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <h4 className="mb-2 text-sm font-bold text-foreground">선택 컬럼</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span>
                  <strong className="text-foreground">문제유형</strong>: 객관식,
                  주관식, 서술형
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span>
                  <strong className="text-foreground">난이도</strong>: 상, 중, 하
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span>
                  <strong className="text-foreground">선지1~5</strong>: 객관식 선지
                  (객관식인 경우)
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 업로드 히스토리 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            업로드 기록
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockUploadHistory.map((history) => (
            <div
              key={history.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-4">
                {history.status === "성공" ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-rose-600" />
                )}
                <div>
                  <p className="font-medium text-foreground">
                    {history.fileName}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {history.uploadDate} | {history.uploader} |{" "}
                    {history.questionCount}문항
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    history.status === "성공"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  )}
                >
                  {history.status}
                </span>
                <Button variant="outline" size="sm">
                  상세보기
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
