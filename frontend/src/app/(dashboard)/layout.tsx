"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/lib/auth";
import { hasTokens } from "geobuk-shared/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !hasTokens()) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated && !hasTokens()) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Sidebar />
      <main className="flex-1" style={{ position: "relative", zIndex: 1 }}>{children}</main>
    </div>
  );
}
