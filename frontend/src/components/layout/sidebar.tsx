"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
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
  Bell,
  Menu,
  X,
  ClipboardList,
  MessageSquare,
} from "lucide-react";
import { WonCircle } from "@/components/icons";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
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
    icon: BookOpen,
    subItems: [
      { title: "수업 계획", href: "/curriculum-management" },
      { title: "수업 기록", href: "/lesson-records" },
    ],
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
  {
    title: "과제 관리",
    href: "/assignment-management",
    icon: ClipboardList,
  },
  {
    title: "비공개 코멘트",
    href: "/comments",
    icon: MessageSquare,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 페이지 이동 시 드롭다운 닫기
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const isSubMenuActive = (subItems?: { href: string }[]) =>
    subItems?.some((item) => isActive(item.href));

  return (
    <>
      {/* ─── Top Navigation Bar ─── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 9999,
          width: "100%",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              height: "56px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Left: Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link
                href="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    height: "28px",
                    width: "28px",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                    backgroundColor: "#3f8efc",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#ffffff",
                    }}
                  >
                    T
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "#3f8efc",
                  }}
                >
                  Teacher Admin
                </span>
              </Link>
            </div>

            {/* Center: Desktop Nav */}
            <nav
              ref={navRef}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
              className="desktop-nav"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                if (item.subItems) {
                  const active = isSubMenuActive(item.subItems);
                  return (
                    <div key={item.title} style={{ position: "relative" }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenMenu(
                            openMenu === item.title ? null : item.title
                          );
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontSize: "14px",
                          fontWeight: 500,
                          cursor: "pointer",
                          border: "none",
                          backgroundColor: active ? "rgba(63,142,252,0.1)" : "transparent",
                          color: active ? "#3f8efc" : "#6b7280",
                          transition: "all 150ms ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                            e.currentTarget.style.color = "#111827";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#6b7280";
                          }
                        }}
                      >
                        <Icon style={{ width: "16px", height: "16px" }} />
                        {item.title}
                        <ChevronDown
                          style={{
                            width: "12px",
                            height: "12px",
                            transform: openMenu === item.title ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 150ms ease",
                          }}
                        />
                      </button>
                      {openMenu === item.title && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: "100%",
                            marginTop: "4px",
                            width: "160px",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            backgroundColor: "#ffffff",
                            padding: "4px 0",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                            zIndex: 99999,
                          }}
                        >
                          {item.subItems.map((sub) => {
                            const subActive = isActive(sub.href);
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setOpenMenu(null)}
                                style={{
                                  display: "block",
                                  padding: "8px 16px",
                                  fontSize: "14px",
                                  textDecoration: "none",
                                  color: subActive ? "#3f8efc" : "#6b7280",
                                  backgroundColor: subActive ? "rgba(63,142,252,0.1)" : "transparent",
                                  fontWeight: subActive ? 600 : 400,
                                  cursor: "pointer",
                                  transition: "all 150ms ease",
                                }}
                                onMouseEnter={(e) => {
                                  if (!subActive) {
                                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!subActive) {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                  }
                                }}
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "14px",
                      fontWeight: 500,
                      textDecoration: "none",
                      cursor: "pointer",
                      backgroundColor: active ? "rgba(63,142,252,0.1)" : "transparent",
                      color: active ? "#3f8efc" : "#6b7280",
                      transition: "all 150ms ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                        e.currentTarget.style.color = "#111827";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#6b7280";
                      }
                    }}
                  >
                    <Icon style={{ width: "16px", height: "16px" }} />
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Icon buttons */}
            <div
              className="desktop-nav"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {/* 결제 */}
              <button
                type="button"
                style={{
                  position: "relative",
                  display: "flex",
                  height: "36px",
                  width: "36px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  border: "none",
                  background: "none",
                  color: "#3f8efc",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
                title="결제"
              >
                <WonCircle style={{ width: "20px", height: "20px" }} />
              </button>
              {/* 알림 */}
              <button
                type="button"
                style={{
                  position: "relative",
                  display: "flex",
                  height: "36px",
                  width: "36px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  border: "none",
                  background: "none",
                  color: "#6b7280",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
                title="알림"
              >
                <Bell style={{ width: "20px", height: "20px" }} />
              </button>
              {/* 계정연동 */}
              <button
                type="button"
                style={{
                  position: "relative",
                  display: "flex",
                  height: "36px",
                  width: "36px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  border: "none",
                  background: "none",
                  color: "#6b7280",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
                title="계정연동"
              >
                <Users style={{ width: "20px", height: "20px" }} />
              </button>
              {/* 로그아웃 */}
              <button
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "50px",
                  padding: "6px 12px",
                  fontSize: "14px",
                  fontWeight: 500,
                  border: "none",
                  background: "none",
                  color: "#6b7280",
                  cursor: "pointer",
                  marginLeft: "4px",
                  transition: "all 150ms ease",
                }}
                title="로그아웃"
              >
                <LogOut style={{ width: "16px", height: "16px" }} />
                <span>로그아웃</span>
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="mobile-only"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: "none",
                padding: "8px",
                border: "none",
                background: "none",
                color: "#6b7280",
                cursor: "pointer",
              }}
            >
              {mobileOpen ? (
                <X style={{ width: "20px", height: "20px" }} />
              ) : (
                <Menu style={{ width: "20px", height: "20px" }} />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div
              className="mobile-only"
              style={{
                display: "none",
                borderTop: "1px solid #e5e7eb",
                paddingBottom: "12px",
                paddingTop: "8px",
              }}
            >
              <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  if (item.subItems) {
                    return (
                      <div key={item.title}>
                        <div
                          style={{
                            padding: "8px 12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                          }}
                        >
                          {item.title}
                        </div>
                        {item.subItems.map((sub) => {
                          const subActive = isActive(sub.href);
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setMobileOpen(false)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                borderRadius: "6px",
                                padding: "8px 20px",
                                fontSize: "14px",
                                textDecoration: "none",
                                color: subActive ? "#4f46e5" : "#6b7280",
                                backgroundColor: subActive ? "#eef2ff" : "transparent",
                                fontWeight: subActive ? 500 : 400,
                                cursor: "pointer",
                              }}
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
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        fontSize: "14px",
                        fontWeight: 500,
                        textDecoration: "none",
                        color: active ? "#4f46e5" : "#6b7280",
                        backgroundColor: active ? "#eef2ff" : "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <Icon style={{ width: "16px", height: "16px" }} />
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
              <div
                style={{
                  marginTop: "12px",
                  borderTop: "1px solid #f3f4f6",
                  paddingTop: "12px",
                  paddingLeft: "12px",
                  paddingRight: "12px",
                }}
              >
                <button
                  type="button"
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    gap: "8px",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    fontSize: "14px",
                    color: "#6b7280",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                >
                  <LogOut style={{ width: "16px", height: "16px" }} />
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Responsive styles */}
      <style jsx global>{`
        @media (max-width: 1023px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
        }
        @media (min-width: 1024px) {
          .mobile-only {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
