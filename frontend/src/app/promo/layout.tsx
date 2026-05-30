import Link from "next/link";
import {
  ArrowRight,
  Users,
  Calendar,
  FileText,
  ClipboardList,
  Star,
  MessageSquare,
  Network,
  Home,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/promo", label: "홈", icon: Home, exact: true },
  { href: "/promo/class", label: "반 운영", icon: Users },
  { href: "/promo/lesson", label: "수업", icon: Calendar },
  { href: "/promo/exam", label: "시험·평가", icon: FileText },
  { href: "/promo/assignment", label: "과제", icon: ClipboardList },
  { href: "/promo/student", label: "학생 케어", icon: Star },
  { href: "/promo/parent", label: "학부모 소통", icon: MessageSquare },
  { href: "/promo/ecosystem", label: "생태계 연동", icon: Network },
];

export default function PromoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      {/* ===== TOP NAV ===== */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/promo" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              T
            </div>
            <span className="text-base font-semibold text-foreground">선생님앱</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            시작하기
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* feature tabs */}
        <nav className="border-t bg-card/50">
          <div className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6">
            <ul className="flex min-w-max items-center gap-1 py-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </header>

      {children}

      <footer className="border-t bg-card py-8 text-center text-xs text-muted-foreground">
        © 거북스쿨 · Teacher Admin ·{" "}
        <a
          href="https://www.tskool.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          tskool.kr
        </a>
      </footer>
    </div>
  );
}
