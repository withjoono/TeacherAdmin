import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  label?: string;
  /** 페이지 전체 로딩 시 true — 넉넉한 세로 여백을 준다. */
  full?: boolean;
}

/** 표준 로딩 스피너. 페이지마다 제각각이던 로딩 표현을 통일한다. */
export function Spinner({ className, label, full }: SpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        full ? "py-24" : "py-12",
        className,
      )}
    >
      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}
