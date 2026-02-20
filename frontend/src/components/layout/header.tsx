"use client";

import { Bell, User, Share2 } from "lucide-react";
import { config } from "@/lib/config";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="gb-header">
      <h2 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-bold)", letterSpacing: "var(--tracking-tight)", color: "var(--color-text)" }}>{title}</h2>

      <div className="gb-header-actions">
        <a
          href={`${config.hubUrl}/account-linkage`}
          target="_blank"
          rel="noopener noreferrer"
          title="계정 연동"
          className="gb-header-icon-btn"
        >
          <Share2 style={{ width: 16, height: 16 }} />
        </a>

        <button className="gb-header-icon-btn" title="알림">
          <Bell style={{ width: 16, height: 16 }} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginLeft: "var(--space-1)" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28, borderRadius: "var(--radius-full)",
            background: "var(--color-primary)", color: "#fff"
          }}>
            <User style={{ width: 14, height: 14 }} />
          </div>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-secondary)" }}>선생님</span>
        </div>
      </div>
    </header>
  );
}
