"use client";

import { Bell, User, Share2 } from "lucide-react";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between px-6" style={{ borderBottom: '1px solid var(--color-border-light)', background: 'var(--color-bg-elevated)' }}>
      <h2 className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>{title}</h2>

      <div className="flex items-center gap-2">
        <a
          href="http://localhost:3000/account-linkage"
          target="_blank"
          rel="noopener noreferrer"
          title="계정 연동"
          className="relative rounded-full p-2 hover:bg-gray-100 transition-colors" style={{ color: 'var(--color-text-tertiary)' }}
        >
          <Share2 className="h-4 w-4" />
        </a>

        <button className="relative rounded-full p-2 hover:bg-gray-100 transition-colors" style={{ color: 'var(--color-text-tertiary)' }}>
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 ml-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: 'var(--color-primary)', color: '#fff' }}>
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>선생님</span>
        </div>
      </div>
    </header>
  );
}
