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
  Upload,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  LogOut,
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
      {
        title: "시험 관리",
        href: "/exam-management",
      },
      {
        title: "문제 업로드",
        href: "/question-upload",
      },
      {
        title: "채점 관리",
        href: "/grading-management",
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(["테스트"]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isSubMenuActive = (subItems?: { href: string }[]) =>
    subItems?.some((item) => pathname === item.href);

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-primary">Teacher Admin</h1>
      </div>

      <nav className="flex-1 overflow-auto space-y-1 p-4">
        {navItems.map((item) => (
          <div key={item.title}>
            {item.subItems ? (
              <>
                {/* 서브메뉴가 있는 경우 */}
                <button
                  onClick={() => toggleMenu(item.title)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isSubMenuActive(item.subItems)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </div>
                  {openMenus.includes(item.title) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {openMenus.includes(item.title) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive(subItem.href)
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        </div>
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* 일반 메뉴 */
              <Link
                href={item.href!}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href!)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t p-4">
        <div className="mb-2 px-3 text-sm text-muted-foreground">
          선생님
        </div>
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-5 w-5" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
