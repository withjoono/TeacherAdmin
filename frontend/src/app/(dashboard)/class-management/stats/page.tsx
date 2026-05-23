"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Clock,
    Users,
    TrendingUp,
    Award,
    BarChart3,
    type LucideIcon,
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
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
            <PageContainer className="space-y-6">
                <PageHeader title="학습 통계" />
                <EmptyState
                    icon={BarChart3}
                    title="클래스 ID가 필요합니다"
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer className="space-y-6">
            <PageHeader
                title="학습 통계"
                description={stats?.arenaName}
                actions={
                    <div className="flex gap-1 rounded-lg bg-muted p-1">
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
                                className={cn(
                                    "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                                    period === value
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                }
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

            {loading ? (
                <Spinner full label="통계를 불러오는 중..." />
            ) : error ? (
                <EmptyState
                    icon={BarChart3}
                    title="통계를 불러올 수 없습니다"
                    description={error}
                />
            ) : stats ? (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label="전체 멤버"
                            value={`${stats.summary.totalMembers}명`}
                            icon={Users}
                        />
                        <StatCard
                            label="활성 멤버"
                            value={`${stats.summary.activeMembers}명`}
                            icon={TrendingUp}
                        />
                        <StatCard
                            label="총 학습 시간"
                            value={formatMinutes(stats.summary.totalStudyMin)}
                            icon={Clock}
                        />
                        <StatCard
                            label="인당 평균"
                            value={formatMinutes(stats.summary.avgStudyMinPerMember)}
                            icon={Award}
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>일별 학습량 추이</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart data={stats.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(v) => {
                                                const d = new Date(v);
                                                return `${d.getMonth() + 1}/${d.getDate()}`;
                                            }}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(v) => `${Math.round(v / 60)}h`}
                                        />
                                        <Tooltip
                                            formatter={(value: any) => [
                                                formatMinutes(Number(value)),
                                                "총 학습 시간",
                                            ]}
                                            labelFormatter={(label) => {
                                                const d = new Date(label);
                                                return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="totalStudyMin"
                                            name="총 학습 시간(분)"
                                            stroke="#6366f1"
                                            strokeWidth={2}
                                            dot={{ fill: "#6366f1", r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="py-12 text-center text-sm text-muted-foreground">
                                    해당 기간의 데이터가 없습니다
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>학생별 학습량 비교</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.memberStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart
                                        data={stats.memberStats.map((m, i) => ({
                                            name: m.authMemberId
                                                ? `학생 ${m.authMemberId.slice(-4)}`
                                                : `멤버 ${i + 1}`,
                                            totalStudyMin: m.totalStudyMin,
                                            avgStudyMin: m.avgStudyMin,
                                            activeDays: m.activeDays,
                                        }))}
                                        layout="vertical"
                                        margin={{ left: 80 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            type="number"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(v) => `${Math.round(v / 60)}h`}
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            tick={{ fontSize: 12 }}
                                            width={70}
                                        />
                                        <Tooltip
                                            formatter={(value: any, name: any) => {
                                                const v = Number(value);
                                                if (name === "activeDays") return [`${v}일`, "활동일"];
                                                return [
                                                    formatMinutes(v),
                                                    name === "totalStudyMin" ? "총 학습" : "일 평균",
                                                ];
                                            }}
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="totalStudyMin"
                                            name="총 학습(분)"
                                            fill="#6366f1"
                                            radius={[0, 4, 4, 0]}
                                        />
                                        <Bar
                                            dataKey="avgStudyMin"
                                            name="일 평균(분)"
                                            fill="#22c55e"
                                            radius={[0, 4, 4, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="py-12 text-center text-sm text-muted-foreground">
                                    등록된 멤버가 없거나 데이터가 없습니다
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>학생별 상세</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.memberStats.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    순위
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    학생 ID
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                                    총 학습 시간
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                                    일 평균
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                                    활동일
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.memberStats.map((member, idx) => (
                                                <tr
                                                    key={member.memberId}
                                                    className="border-b last:border-0 hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={cn(
                                                                "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                                                                idx === 0
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : idx === 1
                                                                      ? "bg-gray-100 text-gray-700"
                                                                      : idx === 2
                                                                        ? "bg-orange-100 text-orange-700"
                                                                        : "text-muted-foreground"
                                                            )}
                                                        >
                                                            {idx + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-foreground">
                                                        {member.authMemberId ||
                                                            `멤버 #${member.memberId}`}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                                                        {formatMinutes(member.totalStudyMin)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-muted-foreground">
                                                        {formatMinutes(member.avgStudyMin)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-muted-foreground">
                                                        {member.activeDays}일
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    데이터가 없습니다
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            ) : null}
        </PageContainer>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: LucideIcon;
}) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="text-xl font-bold text-foreground">{value}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ClassStatsPage() {
    return (
        <Suspense>
            <ClassStatsContent />
        </Suspense>
    );
}
