"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * 루트 페이지 — 무조건 /dashboard로 리다이렉트.
 * sso_code가 있으면 함께 전달하여 SSOListener가 처리할 수 있도록 함.
 * 프로모/랜딩은 Hub(tskool.kr/apps/teacher-admin)에서 제공.
 */
export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        // sso_code가 있으면 /dashboard로 전달
        const params = new URLSearchParams(window.location.search);
        const ssoCode = params.get('sso_code');
        if (ssoCode) {
            router.replace(`/dashboard?sso_code=${encodeURIComponent(ssoCode)}`);
        } else {
            router.replace("/dashboard");
        }
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
