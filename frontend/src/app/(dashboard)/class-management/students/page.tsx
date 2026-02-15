"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
            <div className="flex flex-col">
                <Header title="학생 일괄 등록" />
                <div className="flex-1 p-6 text-center text-muted-foreground">
                    클래스 ID가 필요합니다.
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <Header title="학생 일괄 등록" />

            <div className="flex-1 p-6 space-y-6 max-w-4xl mx-auto w-full">
                <Button variant="outline" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    돌아가기
                </Button>

                <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-4">
                        <div className="flex gap-3">
                            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-700 space-y-1">
                                <p className="font-medium">학생 ID 입력 방법</p>
                                <p>학생들의 Hub ID를 아래 입력란에 입력하세요.</p>
                                <p>줄바꿈, 콤마(,), 세미콜론(;), 탭으로 구분할 수 있습니다.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5" />
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
                            className="w-full h-64 p-4 rounded-lg border bg-background resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {parsedIds.length > 0
                                    ? `${parsedIds.length}개의 ID가 감지되었습니다`
                                    : "ID를 입력해주세요"}
                            </p>
                            <Button onClick={handleSubmit} disabled={loading || parsedIds.length === 0} size="lg">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        등록 중...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        {parsedIds.length}명 등록하기
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <Card className="border-red-300 bg-red-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 text-red-700">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {result && (
                    <div className="space-y-4">
                        {result.registered.count > 0 && (
                            <Card className="border-green-300 bg-green-50">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-green-700">
                                                ✅ {result.registered.count}명 등록 성공
                                            </p>
                                            {result.registered.ids.length > 0 && (
                                                <p className="text-sm text-green-600 mt-1">
                                                    {result.registered.ids.join(", ")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {result.alreadyRegistered.count > 0 && (
                            <Card className="border-blue-300 bg-blue-50">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-blue-700">
                                                ℹ️ {result.alreadyRegistered.count}명 이미 등록됨
                                            </p>
                                            {result.alreadyRegistered.ids.length > 0 && (
                                                <p className="text-sm text-blue-600 mt-1">
                                                    {result.alreadyRegistered.ids.join(", ")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {result.notFound.count > 0 && (
                            <Card className="border-yellow-300 bg-yellow-50">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-yellow-700">
                                                ⚠️ {result.notFound.count}명 미가입
                                            </p>
                                            <p className="text-sm text-yellow-600 mt-1">
                                                {result.notFound.message}
                                            </p>
                                            {result.notFound.ids.length > 0 && (
                                                <div className="mt-2 p-2 bg-yellow-100 rounded text-xs font-mono text-yellow-800">
                                                    {result.notFound.ids.join(", ")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function StudentImportPage() {
    return (
        <Suspense>
            <StudentImportContent />
        </Suspense>
    );
}
