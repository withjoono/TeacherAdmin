import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** 우측 액션 영역 (버튼 등) */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * 페이지 상단 표준 헤더 — 제목 · 설명 · 우측 액션 슬롯.
 * 기존의 <Header> 컴포넌트와 gb-page-title 패턴을 대체한다.
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
