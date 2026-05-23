import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * 페이지 콘텐츠 표준 컨테이너.
 * 최대 너비 · 좌우 여백 · 세로 리듬을 한 곳에서 책임진다.
 * 모든 페이지는 이 컨테이너로 콘텐츠를 감싼다.
 */
export function PageContainer({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
