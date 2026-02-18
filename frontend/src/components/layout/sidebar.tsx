"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Home as HomeIcon,
  BookOpen,
  FileText,
  CheckSquare,
  ChevronDown,
  LogOut,
  Wallet,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href?: string;
  icon: any;
  subItems?: {
    title: string;
    href: string;
  }[];
}

const navItems: NavItem[] = [
  {
    title: "대시보드",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "클래스 관리",
    href: "/class-management",
    icon: Users,
  },
  {
    title: "학생 관리",
    href: "/student-management",
    icon: UserCircle,
  },
  {
    title: "학부모 관리",
    href: "/parent-management",
    icon: HomeIcon,
  },
  {
    title: "수업 현황",
    href: "/curriculum-management",
    icon: BookOpen,
  },
  {
    title: "출석부",
    href: "/attendance",
    icon: CheckSquare,
  },
  {
    title: "테스트",
    icon: FileText,
    subItems: [
      { title: "시험 관리", href: "/exam-management" },
      { title: "문제 업로드", href: "/question-upload" },
      { title: "채점 관리", href: "/grading-management" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [testMenuOpen, setTestMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href;
  const isSubMenuActive = (subItems?: { href: string }[]) =>
    subItems?.some((item) => pathname === item.href);

  return (
    <>
      {/* ─── Top Navigation Bar ─── */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-screen-xl px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600">
                  <span className="text-xs font-bold text-white">T</span>
                </div>
                <span className="text-[15px] font-bold tracking-tight text-indigo-600">
                  Teacher Admin
                </span>
              </Link>
            </div>

            {/* Center: Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) =>
                item.subItems ? (
                  <div key={item.title} className="relative">
                    <button
                      onClick={() => setTestMenuOpen(!testMenuOpen)}
                      className={cn(
                        "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                        isSubMenuActive(item.subItems)
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    {testMenuOpen && (
                      <div className="absolute left-0 top-full mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-50">
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setTestMenuOpen(false)}
                            className={cn(
                              "block px-4 py-2 text-sm transition-colors",
                              isActive(sub.href)
                                ? "text-indigo-600 bg-indigo-50 font-medium"
                                : "text-gray-600 hover:bg-gray-100"
                            )}
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive(item.href!)
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              )}
            </nav>

            {/* Right: Icon buttons */}
            <div className="hidden lg:flex items-center gap-1">
              {/* 결제 */}
              <button
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                title="결제"
              >
                <Wallet className="h-5 w-5" />
              </button>
              {/* 알림 */}
              <button
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="알림"
              >
                <Bell className="h-5 w-5" />
              </button>
              {/* 계정연동 */}
              <button
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="계정연동"
              >
                <Users className="h-5 w-5" />
              </button>
              {/* 로그아웃 */}
              <button
                className="ml-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-gray-100 transition-colors"
                title="로그아웃"
              >
                <LogOut className="h-4 w-4" />
                <span>로그아웃</span>
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="flex lg:hidden p-2 text-gray-500 hover:text-gray-900"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="lg:hidden border-t border-gray-200 pb-3 pt-2">
              <nav className="space-y-1">
                {navItems.map((item) =>
                  item.subItems ? (
                    <div key={item.title}>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">
                        {item.title}
                      </div>
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-5 py-2 text-sm transition-colors",
                            isActive(sub.href)
                              ? "text-indigo-600 bg-indigo-50 font-medium"
                              : "text-gray-600 hover:bg-gray-100"
                          )}
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href!}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive(item.href!)
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  )
                )}
              </nav>
              <div className="mt-3 border-t border-gray-100 pt-3 px-3">
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100">
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
