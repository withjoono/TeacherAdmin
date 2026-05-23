"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    UserPlus,
    CheckCircle2,
    AlertTriangle,
    ArrowLeft,
    Loader2,
    Info,
} from "lucide-react";
import { importStudentsToClass } from "@/lib/api/classes";
import type { ImportStudentsResult } from "@/lib/api/classes";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function StudentImportContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const classId = Number(searchParams.get("id") || "0");

    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImportStudentsResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const parseIds = (text: string): string[] => {
        return text
            .split(/[\n\r,;\t]+/)
            .map((id) => id.trim())
            .filter((id) => id.length > 0);
    };

    const parsedIds = parseIds(inputText);

    const handleSubmit = async () => {
        if (parsedIds.length === 0) {
            setError("등록할 학생 ID를 입력해주세요.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setResult(null);
            const data = await importStudentsToClass(classId, parsedIds);
            setResult(data);
        } catch (err: any) {
            console.error("학생 등록 실패:", err);
            setError(err?.response?.data?.message || "학생 등록 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (!classId) {
        return (
            <PageContainer className="space-y-6">
                <PageHeader title="학생 일괄 등록" />
                <EmptyState icon={UserPlus} title="클래스 ID가 필요합니다" />
            </PageContainer>
        );
    }

    return (
        <PageContainer className="max-w-4xl space-y-6">
            <PageHeader
                title="학생 일괄 등록"
                description="학생 ID를 입력해 클래스에 한번에 등록하세요"
            />

            <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="w-fit"
            >
                <ArrowLeft className="h-4 w-4" />
                돌아가기
            </Button>

            <Card>
                <CardContent className="flex gap-3 p-4">
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">학생 ID 입력 방법</p>
                        <p>학생들의 Hub ID를 아래 입력란에 입력하세요.</p>
                        <p>줄바꿈, 콤마(,), 세미콜론(;), 탭으로 구분할 수 있습니다.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        학생 ID 입력
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <textarea
                        value={inputText}
                        onChange={(e) => {
                            setInputText(e.target.value);
                            setResult(null);
                            setError(null);
                        }}
                        placeholder={`학생 ID를 입력하세요.\n\n예시:\nstudent001\nstudent002\nstudent003\n\n또는 콤마로 구분:\nstudent001, student002, student003`}
                        className="h-64 w-full resize-none rounded-lg border border-input bg-transparent p-4 font-mono text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {parsedIds.length > 0
                                ? `${parsedIds.length}개의 ID가 감지되었습니다`
                                : "ID를 입력해주세요"}
                        </p>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || parsedIds.length === 0}
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    등록 중...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" />
                                    {parsedIds.length}명 등록하기
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <Card className="border-destructive/40 bg-destructive/5">
                    <CardContent className="flex items-center gap-3 p-4 text-destructive">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </CardContent>
                </Card>
            )}

            {result && (
                <div className="space-y-4">
                    {result.registered.count > 0 && (
                        <Card className="border-green-300 bg-green-50">
                            <CardContent className="flex items-start gap-3 p-4">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                                <div>
                                    <p className="font-semibold text-green-700">
                                        {result.registered.count}명 등록 성공
                                    </p>
                                    {result.registered.ids.length > 0 && (
                                        <p className="mt-1 text-sm text-green-600">
                                            {result.registered.ids.join(", ")}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {result.alreadyRegistered.count > 0 && (
                        <Card className="border-blue-300 bg-blue-50">
                            <CardContent className="flex items-start gap-3 p-4">
                                <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                                <div>
                                    <p className="font-semibold text-blue-700">
                                        {result.alreadyRegistered.count}명 이미 등록됨
                                    </p>
                                    {result.alreadyRegistered.ids.length > 0 && (
                                        <p className="mt-1 text-sm text-blue-600">
                                            {result.alreadyRegistered.ids.join(", ")}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {result.notFound.count > 0 && (
                        <Card className="border-yellow-300 bg-yellow-50">
                            <CardContent className="flex items-start gap-3 p-4">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                                <div>
                                    <p className="font-semibold text-yellow-700">
                                        {result.notFound.count}명 미가입
                                    </p>
                                    <p className="mt-1 text-sm text-yellow-600">
                                        {result.notFound.message}
                                    </p>
                                    {result.notFound.ids.length > 0 && (
                                        <div className="mt-2 rounded bg-yellow-100 p-2 font-mono text-xs text-yellow-800">
                                            {result.notFound.ids.join(", ")}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </PageContainer>
    );
}

export default function StudentImportPage() {
    return (
        <Suspense>
            <StudentImportContent />
        </Suspense>
    );
}
