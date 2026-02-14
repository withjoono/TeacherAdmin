"use client";

import { Bell, User, Share2 } from "lucide-react";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <h2 className="text-lg font-semibold">{title}</h2>

      <div className="flex items-center gap-4">
        <a
          href="http://localhost:3000/account-linkage"
          target="_blank"
          rel="noopener noreferrer"
          title="계정 연동"
          className="relative rounded-full p-2 hover:bg-accent"
        >
          <Share2 className="h-5 w-5" />
        </a>
        
        <button className="relative rounded-full p-2 hover:bg-accent">
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">선생님</span>
        </div>
      </div>
    </header>
  );
}
