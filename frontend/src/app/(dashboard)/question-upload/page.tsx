"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  File,
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
    <div className="flex flex-col">
      <Header title="문제 업로드" />

      <div className="flex-1 p-6 space-y-6">
        {/* 업로드 가이드 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <FileSpreadsheet className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold mb-2">Excel 형식</h3>
              <p className="text-sm text-muted-foreground">
                .xlsx, .xls 파일 지원
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <File className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold mb-2">CSV 형식</h3>
              <p className="text-sm text-muted-foreground">
                .csv 파일 지원
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <Download className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-semibold mb-2">템플릿 다운로드</h3>
              <Button variant="outline" size="sm" className="mt-2">
                템플릿 받기
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 파일 업로드 영역 */}
        <Card>
          <CardHeader>
            <CardTitle>파일 업로드</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                파일을 드래그하여 업로드
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                또는 아래 버튼을 클릭하여 파일을 선택하세요
              </p>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                파일 선택
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                지원 형식: Excel (.xlsx, .xls), CSV (.csv) | 최대 10MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 업로드 형식 안내 */}
        <Card>
          <CardHeader>
            <CardTitle>파일 형식 안내</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">필수 컬럼</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>문제번호</strong>: 1, 2, 3...</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>문제내용</strong>: 문제 텍스트</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>정답</strong>: 정답 (객관식: 1~5, 주관식: 텍스트)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>배점</strong>: 점수 (예: 5)</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">선택 컬럼</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span><strong>문제유형</strong>: 객관식, 주관식, 서술형</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span><strong>난이도</strong>: 상, 중, 하</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span><strong>선지1~5</strong>: 객관식 선지 (객관식인 경우)</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 업로드 히스토리 */}
        <Card>
          <CardHeader>
            <CardTitle>업로드 기록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockUploadHistory.map((history) => (
                <div
                  key={history.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    {history.status === "성공" ? (
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">{history.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {history.uploadDate} | {history.uploader} | {history.questionCount}문항
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        history.status === "성공"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {history.status}
                    </span>
                    <Button variant="outline" size="sm">
                      상세보기
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




























