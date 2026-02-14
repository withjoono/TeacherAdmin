import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function generateExamCode(
  grade: string,
  year: number,
  month: number
): string {
  const gradeMap: Record<string, string> = { H1: "H1", H2: "H2", H3: "H3" };
  const yearStr = String(year).slice(-2);
  const monthStr = String(month).padStart(2, "0");
  return `${gradeMap[grade] || "H3"}${yearStr}${monthStr}`;
}

export function parseExamCode(code: string): {
  grade: string;
  year: number;
  month: number;
} | null {
  const match = code.match(/^(H[123])(\d{2})(\d{2})$/);
  if (!match) return null;
  return {
    grade: match[1],
    year: 2000 + parseInt(match[2]),
    month: parseInt(match[3]),
  };
}
