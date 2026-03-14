"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { redirectToHubLogin } from "@/lib/sso";
import {
    ArrowRight,
    GraduationCap,
    Users,
    BarChart3,
    MessageSquare,
    BookOpen,
    Sparkles,
    Loader2,
} from "lucide-react";

const features = [
    {
        icon: Users,
        title: "학생 관리",
        description: "담당 학생의 학습 현황을 한눈에 파악하고\n위험 학생을 즉시 확인하세요.",
        gradient: "from-emerald-500 to-teal-500",
        bgGlow: "bg-emerald-500/10",
    },
    {
        icon: BarChart3,
        title: "성적 분석",
        description: "학생별 성적 추이를 시각화하고\n맞춤형 학습 전략을 수립하세요.",
        gradient: "from-blue-500 to-cyan-500",
        bgGlow: "bg-blue-500/10",
    },
    {
        icon: MessageSquare,
        title: "학부모 소통",
        description: "학부모님과 실시간 쪽지로\n빠르고 체계적인 소통이 가능합니다.",
        gradient: "from-violet-500 to-purple-500",
        bgGlow: "bg-violet-500/10",
    },
    {
        icon: BookOpen,
        title: "미션 관리",
        description: "학습 미션을 생성하고 완료율을\n실시간으로 추적하세요.",
        gradient: "from-amber-500 to-orange-500",
        bgGlow: "bg-amber-500/10",
    },
];

export default function LandingPage() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            setIsRedirecting(true);
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    if (isAuthenticated || isRedirecting) {
        return (
            <div className="flex h-screen w-full items-center justify-center" style={{ background: "#020617" }}>
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                <span className="sr-only">대시보드로 이동 중...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white" style={{ background: "#020617" }}>
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5" style={{ background: "rgba(2,6,23,0.8)", backdropFilter: "blur(16px)" }}>
                <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg" style={{ boxShadow: "0 4px 14px rgba(16,185,129,0.2)" }}>
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">선생님</h1>
                            <p className="text-[10px] tracking-wider text-slate-500">GB PLANNER</p>
                        </div>
                    </div>
                    <button
                        onClick={redirectToHubLogin}
                        className="rounded-lg bg-white/10 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-white/20"
                        style={{ backdropFilter: "blur(8px)" }}
                    >
                        로그인
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background effects */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
                    <div className="absolute right-0 top-1/2 h-[300px] w-[400px] rounded-full bg-teal-500/5 blur-[100px]" />
                </div>

                <div className="relative mx-auto max-w-screen-xl px-4 pb-20 pt-24 text-center sm:px-6 sm:pt-32">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        스마트한 학생 관리의 시작
                    </div>

                    <h2 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                        선생님을 위한{" "}
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                            올인원 관리 도구
                        </span>
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
                        학생 관리, 성적 분석, 학부모 소통을 한 곳에서.
                        <br className="hidden sm:inline" />
                        더 효율적인 학급 운영을 시작해보세요.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <button
                            onClick={redirectToHubLogin}
                            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl transition-all hover:shadow-2xl"
                            style={{ boxShadow: "0 8px 30px rgba(16,185,129,0.25)" }}
                        >
                            시작하기
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </button>
                        <a
                            href="#features"
                            className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-base font-medium text-slate-300 transition-all hover:bg-white/10"
                            style={{ backdropFilter: "blur(8px)" }}
                        >
                            기능 더 알아보기
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="mx-auto mt-20 grid max-w-2xl gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-3">
                        {[
                            { value: "실시간", label: "학습 현황 추적" },
                            { value: "즉시", label: "위험 학생 알림" },
                            { value: "1:1", label: "학부모 소통" },
                        ].map((stat, i) => (
                            <div key={i} className="px-6 py-5 text-center" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}>
                                <p className="text-2xl font-bold text-emerald-400">{stat.value}</p>
                                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative border-t border-white/5 py-24" style={{ background: "rgba(15,23,42,0.5)" }}>
                <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
                    <div className="mb-16 text-center">
                        <h3 className="text-3xl font-bold sm:text-4xl">
                            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                강력한 기능, 간편한 관리
                            </span>
                        </h3>
                        <p className="mt-4 text-lg text-slate-500">
                            선생님의 일상을 더 스마트하게 만들어드립니다.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="group relative overflow-hidden rounded-2xl border border-white/5 p-6 transition-all hover:border-white/10"
                                style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(8px)" }}
                            >
                                <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${feature.bgGlow} opacity-0 blur-2xl transition-opacity group-hover:opacity-100`} />
                                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                                    <feature.icon className="h-6 w-6 text-white" />
                                </div>
                                <h4 className="mb-2 text-lg font-bold text-white">{feature.title}</h4>
                                <p className="text-sm leading-relaxed text-slate-400 whitespace-pre-line">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative border-t border-white/5 py-24">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[100px]" />
                </div>
                <div className="relative mx-auto max-w-screen-md px-4 text-center sm:px-6">
                    <h3 className="text-3xl font-bold text-white sm:text-4xl">
                        지금 바로 시작하세요
                    </h3>
                    <p className="mt-4 text-lg text-slate-400">
                        무료로 가입하고 학생 관리를 더 효율적으로 시작해보세요.
                    </p>
                    <button
                        onClick={redirectToHubLogin}
                        className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-10 py-4 text-lg font-semibold text-white shadow-xl transition-all hover:shadow-2xl"
                        style={{ boxShadow: "0 8px 30px rgba(16,185,129,0.25)" }}
                    >
                        무료로 시작하기
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8" style={{ background: "#020617" }}>
                <div className="mx-auto max-w-screen-xl px-4 text-center sm:px-6">
                    <div className="flex items-center justify-center gap-2 text-slate-600">
                        <GraduationCap className="h-4 w-4" />
                        <span className="text-sm">&copy; 2026 선생님 · GB Planner. All rights reserved.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
