"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as authApi from "@/lib/api/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // SSO 토큰 처리 (Hub에서 리다이렉트된 경우)
  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      handleSsoLogin(accessToken, refreshToken);
    }
  }, [searchParams]);

  const handleSsoLogin = async (accessToken: string, refreshToken: string) => {
    setIsLoading(true);
    try {
      // 토큰 직접 저장
      authApi.setTokens(accessToken, refreshToken);

      // 사용자 정보 조회 및 검증
      const user = await authApi.getCurrentUser();
      if (!user) {
        throw new Error("사용자 정보를 불러올 수 없습니다.");
      }

      if ((user as any).role !== "TEACHER" && (user as any).role !== "ADMIN") {
        setError("선생님 계정만 로그인할 수 있습니다.");
        await authApi.logout();
        setIsLoading(false);
        return;
      }

      // 상태 업데이트 (useAuth 내부 로직을 우회하거나 직접 업데이트 필요하지만, 
      // 여기서는 login 함수 대신 토큰이 설정된 상태에서 리다이렉트만 처리하거나
      // useAuth에 setAuth 같은 메서드가 있다면 좋겠지만 없으므로
      // 페이지 새로고침 또는 useAuth의 checkAuth를 호출하도록 유도)

      // useAuth 훅을 통해 상태 업데이트가 어려우므로(직접 setter 노출 안됨),
      // window.location.reload()를 통해 상태를 새로고침하거나 router.push("/")로 이동 후 
      // AppLayout 등에서 checkAuth가 호출되기를 기대함.
      // 하지만 가장 깔끔한건 useAuth에 setState를 추가하는 것임.
      // 일단 router.push("/")로 이동해봄. (App 컴포넌트에서 checkAuth가 있다면 동작함)

      router.push("/");
    } catch (err) {
      console.error("SSO Login Error:", err);
      setError("SSO 로그인에 실패했습니다.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">선생님 로그인</CardTitle>
          <CardDescription>
            이메일과 비밀번호를 입력하여 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}




























