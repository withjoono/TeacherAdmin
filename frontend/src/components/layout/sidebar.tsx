"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Users,
  BookOpen,
  FileText,
  ChevronDown,
  LogOut,
  Bell,
  Menu,
  X,
  ClipboardList,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { WonCircle, Acorn } from "@/components/icons";
import { cn } from "@/lib/utils";
import { config } from "@/lib/config";
import { useAuthStore } from "@/lib/auth";
import { redirectToHubLogout } from "@/lib/sso";
import { getAccessToken, getRefreshToken } from "geobuk-shared/auth";
import { QuickStartDialog } from "@/components/quick-start";

/** Hub URL에 SSO 토큰을 포함시켜 자동 로그인 지원 — 클라이언트에서만 호출 */
function buildHubUrl(path: string): string {
  const base = `${config.hubUrl}${path}`;
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  if (!accessToken) return base;
  const url = new URL(base);
  url.searchParams.set("sso_access_token", accessToken);
  if (refreshToken) url.searchParams.set("sso_refresh_token", refreshToken);
  return url.toString();
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  subItems?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: "클래스",
    icon: Users,
    subItems: [
      { title: "클래스", href: "/class-management" },
      { title: "학생 관리", href: "/student-management" },
    ],
  },
  {
    title: "수업",
    icon: BookOpen,
    subItems: [
      { title: "수업 계획", href: "/curriculum-management" },
      { title: "수업 기록", href: "/lesson-records" },
      { title: "출석부", href: "/attendance" },
    ],
  },
  { title: "과제", href: "/assignment-management", icon: ClipboardList },
  {
    title: "시험",
    icon: FileText,
    subItems: [
      { title: "시험 출제", href: "/exams" },
      { title: "주관식 채점", href: "/exams/grading" },
    ],
  },
  {
    title: "상담",
    icon: MessageSquare,
    subItems: [
      { title: "비공개 코멘트", href: "/comments" },
      { title: "학부모 관리", href: "/parent-management" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [userOpen, setUserOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Hub URLs — SSR-safe 기본값, 하이드레이션 후 토큰 포함 URL로 보강
  const [hubUrls, setHubUrls] = useState({
    myAcorns: `${config.hubUrl}/my-acorns`,
    products: `${config.hubUrl}/products`,
    accountLinkage: `${config.hubUrl}/account-linkage`,
    profile: `${config.hubUrl}/users/profile`,
    payment: `${config.hubUrl}/users/payment`,
  });

  useEffect(() => {
    setHubUrls({
      myAcorns: buildHubUrl("/my-acorns"),
      products: buildHubUrl("/products"),
      accountLinkage: buildHubUrl("/account-linkage"),
      profile: buildHubUrl("/users/profile"),
      payment: buildHubUrl("/users/payment"),
    });
  }, []);

  const handleLogout = () => {
    setUserOpen(false);
    setMobileOpen(false);
    useAuthStore.getState().logout();
    redirectToHubLogout();
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");
  const isSubMenuActive = (subItems?: { href: string }[]) =>
    subItems?.some((item) => isActive(item.href));

  const navLink =
    "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors";
  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            T
          </div>
          <span className="text-[15px] font-bold tracking-tight text-primary">
            Teacher Admin
          </span>
        </Link>

        {/* Desktop nav */}
        <nav ref={navRef} className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.subItems) {
              const active = isSubMenuActive(item.subItems);
              return (
                <div key={item.title} className="relative">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={openMenu === item.title}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenMenu(openMenu === item.title ? null : item.title);
                    }}
                    className={cn(
                      navLink,
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform",
                        openMenu === item.title && "rotate-180",
                      )}
                    />
                  </button>
                  {openMenu === item.title && (
                    <div className="absolute left-0 top-full mt-1 w-40 overflow-hidden rounded-lg border bg-card py-1 shadow-lg">
                      {item.subItems.map((sub) => {
                        const subActive = isActive(sub.href);
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setOpenMenu(null)}
                            className={cn(
                              "block px-4 py-2 text-sm transition-colors",
                              subActive
                                ? "bg-primary/10 font-semibold text-primary"
                                : "text-muted-foreground hover:bg-accent",
                            )}
                          >
                            {sub.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            const active = isActive(item.href!);
            return (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  navLink,
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Right icons (desktop) */}
        <div className="hidden items-center gap-1 lg:flex">
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            title="사용법"
            aria-label="사용법"
            className={iconBtn}
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <a
            href={hubUrls.myAcorns}
            target="_blank"
            rel="noopener noreferrer"
            title="내 도토리"
            className={iconBtn}
          >
            <Acorn className="h-5 w-5" />
          </a>
          <a
            href={hubUrls.products}
            target="_blank"
            rel="noopener noreferrer"
            title="이용권 구매"
            className={cn(iconBtn, "text-primary")}
          >
            <WonCircle className="h-5 w-5" />
          </a>
          <button type="button" title="알림" aria-label="알림" className={iconBtn}>
            <Bell className="h-5 w-5" />
          </button>
          <a
            href={hubUrls.accountLinkage}
            target="_blank"
            rel="noopener noreferrer"
            title="계정연동"
            className={iconBtn}
          >
            <Users className="h-5 w-5" />
          </a>

          {/* User dropdown */}
          <div className="relative ml-1">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={userOpen}
              onClick={() => setUserOpen(!userOpen)}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span>선생님</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {userOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-lg border bg-card py-1 shadow-lg">
                  <a
                    href={hubUrls.profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    마이 페이지
                  </a>
                  <a
                    href={hubUrls.payment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    결제내역
                  </a>
                  <div className="my-1 border-t" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground lg:hidden"
          aria-label="메뉴"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t lg:hidden">
          <nav className="mx-auto max-w-[1280px] space-y-1 px-4 py-3">
            <button
              type="button"
              onClick={() => { setMobileOpen(false); setHelpOpen(true); }}
              className="flex w-full items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
            >
              <HelpCircle className="h-4 w-4" />
              사용법 — 빠른 시작
            </button>
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.subItems) {
                return (
                  <div key={item.title}>
                    <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.title}
                    </div>
                    {item.subItems.map((sub) => {
                      const subActive = isActive(sub.href);
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "block rounded-md px-5 py-2 text-sm transition-colors",
                            subActive
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-muted-foreground hover:bg-accent",
                          )}
                        >
                          {sub.title}
                        </Link>
                      );
                    })}
                  </div>
                );
              }
              const active = isActive(item.href!);
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
            <div className="mt-2 space-y-1 border-t pt-2">
              <a
                href={hubUrls.profile}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
              >
                마이 페이지
              </a>
              <a
                href={hubUrls.payment}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
              >
                결제내역
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </button>
            </div>
          </nav>
        </div>
      )}

      <QuickStartDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </header>
  );
}
