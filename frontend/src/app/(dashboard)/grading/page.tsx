"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Users } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth";
import { mockExamApi, gradingApi, type MockExam, type GradeResult } from "@/lib/api";

const subjectOptions = [
  { value: "국어", label: "국어" },
  { value: "수학", label: "수학" },
  { value: "영어", label: "영어" },
  { value: "탐구1", label: "탐구1" },
  { value: "탐구2", label: "탐구2" },
  { value: "한국사", label: "한국사" },
];

export default function GradingPage() {
  const { accessToken } = useAuthStore();
  const [exams, setExams] = useState<MockExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);

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

  const handleAnswerChange = (questionNumber: number, value: string) => {
    const numValue = parseInt(value);
    if (value === "" || (numValue >= 1 && numValue <= 5)) {
      setAnswers((prev) => ({
        ...prev,
        [questionNumber]: numValue || 0,
      }));
    }
  };

  const handleGrade = async () => {
    if (!accessToken || !selectedExamId || !selectedSubject) return;

    const answerArray = Object.entries(answers)
      .filter(([_, value]) => value >= 1 && value <= 5)
      .map(([key, value]) => ({
        questionNumber: parseInt(key),
        answer: value,
      }));

    if (answerArray.length === 0) {
      alert("최소 하나의 답안을 입력해주세요.");
      return;
    }

    setIsGrading(true);
    setResult(null);

    try {
      if (studentId) {
        const gradeResult = await gradingApi.submit(
          {
            studentId: parseInt(studentId),
            mockExamId: parseInt(selectedExamId),
            subject: selectedSubject,
            answers: answerArray,
            saveScore: true,
          },
          accessToken
        );
        setResult(gradeResult);
      } else {
        const gradeResult = await mockExamApi.grade(
          {
            mockExamId: parseInt(selectedExamId),
            subject: selectedSubject,
            answers: answerArray,
          },
          accessToken
        );
        setResult(gradeResult);
      }
    } catch (error) {
      console.error("Grading failed:", error);
      alert("채점에 실패했습니다.");
    } finally {
      setIsGrading(false);
    }
  };

  const resetForm = () => {
    setAnswers({});
    setResult(null);
  };

  const examOptions = exams.map((e) => ({
    value: String(e.id),
    label: `${e.code} - ${e.name}`,
  }));

  const questionCount = selectedSubject === "영어" ? 45 : selectedSubject === "한국사" ? 20 : 45;

  return (
    <div className="flex flex-col">
      <Header title="채점 관리" />

      <div className="flex-1 p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                답안 입력
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>시험 선택</Label>
                  <Select
                    options={examOptions}
                    placeholder="시험을 선택하세요"
                    value={selectedExamId}
                    onChange={(e) => {
                      setSelectedExamId(e.target.value);
                      resetForm();
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>과목</Label>
                  <Select
                    options={subjectOptions}
                    placeholder="과목을 선택하세요"
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      resetForm();
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>학생 ID (선택)</Label>
                  <Input
                    type="number"
                    placeholder="점수 저장시 입력"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
              </div>

              {selectedExamId && selectedSubject && (
                <>
                  <div className="mb-4 rounded-lg bg-muted p-3 text-sm">
                    <p>1-5 사이의 숫자로 답안을 입력하세요. (빈칸은 무시됩니다)</p>
                  </div>

                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-9 md:grid-cols-10">
                    {Array.from({ length: questionCount }, (_, i) => i + 1).map(
                      (num) => (
                        <div key={num} className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            {num}번
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            className="h-9 text-center"
                            value={answers[num] || ""}
                            onChange={(e) =>
                              handleAnswerChange(num, e.target.value)
                            }
                          />
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-6 flex gap-4">
                    <Button
                      onClick={handleGrade}
                      disabled={isGrading || Object.keys(answers).length === 0}
                    >
                      {isGrading ? "채점 중..." : "채점하기"}
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      초기화
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>채점 결과</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-primary/10 p-4 text-center">
                    <p className="text-sm text-muted-foreground">획득 점수</p>
                    <p className="text-3xl font-bold text-primary">
                      {result.earnedScore}
                      <span className="text-lg font-normal text-muted-foreground">
                        /{result.totalScore}
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <p className="text-muted-foreground">정답 수</p>
                      <p className="text-xl font-semibold text-green-600">
                        {result.correctCount}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <p className="text-muted-foreground">오답 수</p>
                      <p className="text-xl font-semibold text-red-600">
                        {result.totalQuestions - result.correctCount}
                      </p>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-auto">
                    <p className="mb-2 text-sm font-medium">문제별 결과</p>
                    <div className="space-y-1">
                      {result.results.map((r) => (
                        <div
                          key={r.questionNumber}
                          className={`flex items-center justify-between rounded px-2 py-1 text-sm ${
                            r.isCorrect ? "bg-green-50" : "bg-red-50"
                          }`}
                        >
                          <span>{r.questionNumber}번</span>
                          <span>
                            {r.studentAnswer} → {r.correctAnswer}
                          </span>
                          <span
                            className={
                              r.isCorrect ? "text-green-600" : "text-red-600"
                            }
                          >
                            {r.isCorrect ? "O" : "X"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {studentId && (
                    <div className="rounded-lg bg-green-500/10 p-3 text-center text-sm text-green-600">
                      학생 ID {studentId}의 점수가 저장되었습니다.
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Users className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p>답안을 입력하고 채점하면</p>
                  <p>결과가 여기에 표시됩니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
