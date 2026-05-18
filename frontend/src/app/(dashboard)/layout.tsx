"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // 클라이언트에서만 localStorage 접근 가능
    const { hasTokens } = require("geobuk-shared/auth");
    // sso_code가 있으면 SSOListener가 처리 중이므로 리다이렉트 하지 않음 (무한 루프 방지)
    const hasSSOCode = new URLSearchParams(window.location.search).has('sso_code');
    if (!isAuthenticated && !hasTokens() && !hasSSOCode) {
      router.push("/login");
    }
    setChecked(true);
  }, [isAuthenticated, router]);

  if (!checked) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Sidebar />
      <main className="flex-1" style={{ position: "relative", zIndex: 1 }}>{children}</main>
    </div>
  );
}
