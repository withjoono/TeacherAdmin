"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth";
import { mockExamApi, type CreateMockExamDto } from "@/lib/api";
import { generateExamCode } from "@/lib/utils";

const examSchema = z.object({
  name: z.string().min(1, "시험명을 입력해주세요"),
  grade: z.enum(["H1", "H2", "H3"], { message: "학년을 선택해주세요" }),
  year: z.number().min(2020).max(2030),
  month: z.number().min(1).max(12),
  type: z.enum(["교육청", "평가원", "수능"], { message: "유형을 선택해주세요" }),
});

type ExamForm = z.infer<typeof examSchema>;

const gradeOptions = [
  { value: "H1", label: "고1" },
  { value: "H2", label: "고2" },
  { value: "H3", label: "고3" },
];

const typeOptions = [
  { value: "교육청", label: "교육청" },
  { value: "평가원", label: "평가원" },
  { value: "수능", label: "수능" },
];

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}월`,
}));

const yearOptions = Array.from({ length: 6 }, (_, i) => ({
  value: String(2024 + i),
  label: `${2024 + i}년`,
}));

export default function NewExamPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExamForm>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    },
  });

  const watchGrade = watch("grade");
  const watchYear = watch("year");
  const watchMonth = watch("month");

  const generatedCode =
    watchGrade && watchYear && watchMonth
      ? generateExamCode(watchGrade, watchYear, watchMonth)
      : "";

  const onSubmit = async (data: ExamForm) => {
    if (!accessToken) return;

    setError(null);
    setIsSubmitting(true);

    const examData: CreateMockExamDto = {
      ...data,
      code: generateExamCode(data.grade, data.year, data.month),
    };

    try {
      await mockExamApi.create(examData, accessToken);
      router.push("/exams");
    } catch (err) {
      setError("시험 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Header title="새 시험 생성" />

      <div className="flex-1 p-6">
        <div className="mb-4">
          <Link
            href="/exams"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            시험 목록으로 돌아가기
          </Link>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>시험 정보 입력</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">시험명</Label>
                <Input
                  id="name"
                  placeholder="예: 2024년 3월 고3 모의고사"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">학년</Label>
                  <Select
                    id="grade"
                    options={gradeOptions}
                    placeholder="학년 선택"
                    {...register("grade")}
                  />
                  {errors.grade && (
                    <p className="text-sm text-destructive">
                      {errors.grade.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">유형</Label>
                  <Select
                    id="type"
                    options={typeOptions}
                    placeholder="유형 선택"
                    {...register("type")}
                  />
                  {errors.type && (
                    <p className="text-sm text-destructive">
                      {errors.type.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">년도</Label>
                  <Select
                    id="year"
                    options={yearOptions}
                    {...register("year", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="month">월</Label>
                  <Select
                    id="month"
                    options={monthOptions}
                    {...register("month", { valueAsNumber: true })}
                  />
                </div>
              </div>

              {generatedCode && (
                <div className="rounded-lg bg-muted p-4">
                  <Label className="text-muted-foreground">
                    자동 생성된 시험 코드
                  </Label>
                  <p className="mt-1 font-mono text-lg font-semibold">
                    {generatedCode}
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "생성 중..." : "시험 생성"}
                </Button>
                <Link href="/exams">
                  <Button type="button" variant="outline">
                    취소
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
