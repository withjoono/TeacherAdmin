"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Users,
  Calendar,
  ClipboardList,
  FileText,
  PenLine,
  Star,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

interface Step {
  icon: LucideIcon;
  tone: string; // tailwind classes for tinted icon tile
  title: string;
  body: string;
  href: string;
  hint?: string;
}

const STEPS: Step[] = [
  {
    icon: Users,
    tone: "bg-blue-50 text-blue-600",
    title: "첫 반 만들기",
    body: "초대코드를 발급해 학생이 Hub 계정연동으로 가입하게 합니다.",
    href: "/class-management",
    hint: "같은 시간에 듣는 학생끼리 한 반.",
  },
  {
    icon: Calendar,
    tone: "bg-emerald-50 text-emerald-600",
    title: "수업 계획 세우기",
    body: "제목만 필수, 요일·시간·과목·교재·총회차는 빈칸 허용.",
    href: "/curriculum-management",
    hint: "날짜를 적으면 학생 Classboard 일정에 과목·선생님명이 자동 표식.",
  },
  {
    icon: ClipboardList,
    tone: "bg-amber-50 text-amber-600",
    title: "수업 기록·출결",
    body: "수업이 끝나면 회차별 내용을 짧게 메모. 출결은 반·날짜 일괄.",
    href: "/lesson-records",
  },
  {
    icon: FileText,
    tone: "bg-rose-50 text-rose-600",
    title: "시험 출제 (자동화)",
    body: "전체 객관식·전체 배점·정답 일괄 입력 → 클릭 4번으로 출제.",
    href: "/exams/new",
    hint: "객관식·단답형은 학생 제출 즉시 자동 채점.",
  },
  {
    icon: PenLine,
    tone: "bg-violet-50 text-violet-600",
    title: "주관식 채점",
    body: "자동채점 안 되는 주관식만 답안 보고 점수 부여.",
    href: "/exams/grading",
  },
  {
    icon: Star,
    tone: "bg-pink-50 text-pink-600",
    title: "학생 케어",
    body: "학생 상세에서 플래너 1~10점 채점, 비공개 코멘트로 즉시 소통.",
    href: "/student-management",
  },
];

interface QuickStartProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function QuickStartDialog({ open, onOpenChange }: QuickStartProps) {
  const router = useRouter();

  const goTo = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>빠른 시작 — 핵심 6단계</DialogTitle>
          <DialogDescription>
            순서대로 따라하면 됩니다. 각 카드를 누르면 해당 화면으로 바로 이동합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={s.title}
                type="button"
                onClick={() => goTo(s.href)}
                className="group flex w-full items-start gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.tone}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      STEP {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {s.title}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                  {s.hint && (
                    <p className="mt-1 text-[11px] text-muted-foreground/80">
                      💡 {s.hint}
                    </p>
                  )}
                </div>
                <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          기능별 자세한 설명·자주 묻는 질문은 빈 화면(empty state)의 안내와 각 페이지의 도움말 문구에서 확인할 수 있어요.
        </p>
      </DialogContent>
    </Dialog>
  );
}
