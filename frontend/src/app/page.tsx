"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, BarChart3, Loader2 } from "lucide-react";

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
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="sr-only">대시보드로 이동 중...</span>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container px-4 flex h-16 items-center justify-between mx-auto">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <ShieldCheck className="h-6 w-6" />
                        <span>Teacher Admin</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/auth/login">
                            <Button>로그인</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-24 bg-gradient-to-b from-primary/5 to-background">
                <div className="space-y-6 max-w-3xl">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                        선생님을 위한 <span className="text-primary">스마트한 관리 도구</span>
                    </h1>
                    <p className="text-xl text-muted-foreground w-full">
                        학생 관리, 성적 분석, 학부모 소통을 한 곳에서.<br className="hidden sm:inline" />
                        더 효율적인 학급 운영을 시작해보세요.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 w-full items-center">
                        <Link href="/auth/login">
                            <Button size="lg" className="gap-2">
                                시작하기 <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline">
                            기능 더 알아보기
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-background">
                <div className="container px-4 mx-auto">
                    <div className="grid gap-12 md:grid-cols-3">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-full bg-blue-100 text-blue-600">
                                <BarChart3 className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold">성적 분석</h3>
                            <p className="text-muted-foreground">
                                학생들의 성적 추이를 시각적으로 분석하고<br />
                                맞춤형 학습 전략을 수립하세요.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-full bg-green-100 text-green-600">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold">출결 관리</h3>
                            <p className="text-muted-foreground">
                                복잡한 출결 관리를 간편하게.<br />
                                학부모님께지 자동으로 알림을 보냅니다.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-full bg-purple-100 text-purple-600">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold">안전한 데이터</h3>
                            <p className="text-muted-foreground">
                                학생들의 소중한 개인정보를<br />
                                안전하게 보호하고 관리합니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t bg-muted/30">
                <div className="container text-center text-sm text-muted-foreground mx-auto">
                    <p>&copy; 2026 Teacher Admin. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
