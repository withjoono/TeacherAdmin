"use client";

import { Sidebar } from "@/components/layout/sidebar";

// TODO: 개발 완료 후 인증 로직 복원
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 개발용: 인증 우회
  // const router = useRouter();
  // const { isAuthenticated } = useAuthStore();
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push("/login");
  //   }
  // }, [isAuthenticated, router]);
  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    <div className="flex min-h-screen flex-col">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
