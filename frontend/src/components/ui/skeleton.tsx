import { cn } from "@/lib/utils";

/**
 * 콘텐츠 로딩 자리표시자.
 * 데이터를 기다리는 동안 최종 레이아웃 형태를 미리 보여준다.
 * 예: <Skeleton className="h-4 w-32" />
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
    />
  );
}
