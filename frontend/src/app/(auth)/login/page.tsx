"use client";

import { useEffect } from "react";
import { redirectToHubLogin } from "@/lib/sso";

/**
 * /login 페이지
 * Hub SSO로 리다이렉트 — 모든 로그인은 Hub(tskool.kr)에서 처리
 * 이메일, 구글, 네이버 등 모든 로그인 수단은 Hub에서 제공
 */
export default function LoginPage() {
  useEffect(() => {
    redirectToHubLogin();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-2">
        <div style={{ fontSize: "2rem", animation: "spin 1.2s linear infinite" }}>⏳</div>
        <p className="text-muted-foreground">Hub 로그인 페이지로 이동 중...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

