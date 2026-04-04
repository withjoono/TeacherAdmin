"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * 루트 페이지 — 무조건 /dashboard로 리다이렉트.
 * 프로모/랜딩은 Hub(tskool.kr/apps/teacher-admin)에서 제공.
 */
export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard");
    }, [router]);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                background: "var(--color-bg, #f8fafc)",
            }}
        >
            <Loader2
                style={{
                    width: 32,
                    height: 32,
                    color: "var(--color-primary, #3b82f6)",
                    animation: "spin 1s linear infinite",
                }}
            />
        </div>
    );
}
