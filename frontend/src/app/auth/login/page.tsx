"use client";

import { useEffect } from "react";
import { redirectToHubLogin } from "@/lib/sso";

/**
 * /auth/login 페이지
 * Hub SSO로 리다이렉트하는 페이지
 */
export default function LoginPage() {
  useEffect(() => {
    redirectToHubLogin();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-muted-foreground">Hub 로그인 페이지로 이동 중...</p>
    </div>
  );
}
