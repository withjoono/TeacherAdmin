"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "geobuk-shared/ui";
import { Button } from "geobuk-shared/ui";
import {
    ArrowLeft,
    Loader2,
    Clock,
    Users,
    TrendingUp,
    Award,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend,
} from "recharts";
import { getClassStats } from "@/lib/api/classes";
import type { ClassStats } from "@/lib/api/classes";

function ClassStatsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const classId = Number(searchParams.get("id") || "0");

    const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
    const [stats, setStats] = useState<ClassStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!classId) return;
        async function fetchStats() {
            try {
                setLoading(true);
                setError(null);
                const data = await getClassStats(classId, period);
                setStats(data);
            } catch (err: any) {
                console.error("통계 로딩 실패:", err);
                setError("통계 데이터를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [classId, period]);

    const formatMinutes = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}분`;
        return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    };

    if (!classId) {
        return (
            <div className="flex flex-col">
                <Header title="학습 통계" />
                <div className="flex-1 p-6 text-center text-muted-foreground">
                    클래스 ID가 필요합니다.
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <Header title="학습 통계" />

            <div className="flex-1 p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        돌아가기
                    </Button>

                    <div className="flex gap-1 bg-muted rounded-lg p-1">
                        {(
                            [
                                { value: "daily", label: "일간" },
                                { value: "weekly", label: "주간" },
                                { value: "monthly", label: "월간" },
                            ] as const
                        ).map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setPeriod(value)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${period === value
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            <p>{error}</p>
                        </CardContent>
                    </Card>
                ) : stats ? (
                    <>
                        <h2 className="text-xl font-bold">{stats.arenaName}</h2>

                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-100">
                                            <Users className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">전체 멤버</p>
                                            <p className="text-xl font-bold">{stats.summary.totalMembers}명</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-green-100">
                                            <TrendingUp className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">활성 멤버</p>
                                            <p className="text-xl font-bold">{stats.summary.activeMembers}명</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-purple-100">
                                            <Clock className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">총 학습 시간</p>
                                            <p className="text-xl font-bold">{formatMinutes(stats.summary.totalStudyMin)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-orange-100">
                                            <Award className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">인당 평균</p>
                                            <p className="text-xl font-bold">{formatMinutes(stats.summary.avgStudyMinPerMember)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader><CardTitle>📊 일별 학습량 추이</CardTitle></CardHeader>
                            <CardContent>
                                {stats.chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={350}>
                                        <LineChart data={stats.chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth() + 1}/${d.getDate()}`; }} />
                                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${Math.round(v / 60)}h`} />
                                            <Tooltip formatter={(value: any) => [formatMinutes(Number(value)), "총 학습 시간"]} labelFormatter={(label) => { const d = new Date(label); return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`; }} />
                                            <Legend />
                                            <Line type="monotone" dataKey="totalStudyMin" name="총 학습 시간(분)" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground py-12">해당 기간의 데이터가 없습니다</div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>📈 학생별 학습량 비교</CardTitle></CardHeader>
                            <CardContent>
                                {stats.memberStats.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={stats.memberStats.map((m, i) => ({ name: m.authMemberId ? `학생 ${m.authMemberId.slice(-4)}` : `멤버 ${i + 1}`, totalStudyMin: m.totalStudyMin, avgStudyMin: m.avgStudyMin, activeDays: m.activeDays }))} layout="vertical" margin={{ left: 80 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${Math.round(v / 60)}h`} />
                                            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} />
                                            <Tooltip formatter={(value: any, name: any) => { const v = Number(value); if (name === "activeDays") return [`${v}일`, "활동일"]; return [formatMinutes(v), name === "totalStudyMin" ? "총 학습" : "일 평균"]; }} />
                                            <Legend />
                                            <Bar dataKey="totalStudyMin" name="총 학습(분)" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                            <Bar dataKey="avgStudyMin" name="일 평균(분)" fill="#22c55e" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground py-12">등록된 멤버가 없거나 데이터가 없습니다</div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>📋 학생별 상세</CardTitle></CardHeader>
                            <CardContent>
                                {stats.memberStats.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">순위</th>
                                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">학생 ID</th>
                                                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">총 학습 시간</th>
                                                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">일 평균</th>
                                                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">활동일</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.memberStats.map((member, idx) => (
                                                    <tr key={member.memberId} className="border-b last:border-0 hover:bg-muted/50">
                                                        <td className="py-3 px-4">
                                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? "bg-yellow-100 text-yellow-700" : idx === 1 ? "bg-gray-100 text-gray-700" : idx === 2 ? "bg-orange-100 text-orange-700" : "text-muted-foreground"}`}>
                                                                {idx + 1}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 font-medium">{member.authMemberId || `멤버 #${member.memberId}`}</td>
                                                        <td className="py-3 px-4 text-right font-semibold">{formatMinutes(member.totalStudyMin)}</td>
                                                        <td className="py-3 px-4 text-right text-muted-foreground">{formatMinutes(member.avgStudyMin)}</td>
                                                        <td className="py-3 px-4 text-right text-muted-foreground">{member.activeDays}일</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground py-8">데이터가 없습니다</div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default function ClassStatsPage() {
    return (
        <Suspense>
            <ClassStatsContent />
        </Suspense>
    );
}

