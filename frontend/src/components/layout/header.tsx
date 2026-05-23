import { PageHeader } from "@/components/ui/page-header";
import type { ReactNode } from "react";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * 페이지 상단 헤더 (레거시 호환 래퍼).
 * 신규 페이지는 PageContainer + PageHeader 를 직접 사용하세요.
 * 기존 <Header title="..."> 호출부와의 호환을 위해 유지합니다.
 */
export function Header({ title, description, actions }: HeaderProps) {
  return (
    <div className="px-6 pt-5">
      <PageHeader title={title} description={description} actions={actions} />
    </div>
  );
}
