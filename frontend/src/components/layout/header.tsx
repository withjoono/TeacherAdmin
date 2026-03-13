"use client";

import { useState } from "react";
import { Bell, Users, ChevronDown, LogOut } from "lucide-react";
import { WonCircle } from "@/components/icons";
import { config } from "@/lib/config";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const [userOpen, setUserOpen] = useState(false);

  return (
    <header className="gb-header">
      <h2 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-bold)", letterSpacing: "var(--tracking-tight)", color: "var(--color-text)" }}>{title}</h2>

      <div className="gb-header-actions">
        {/* 이용권 구매 */}
        <a
          href={`${config.hubUrl}/products`}
          target="_blank"
          rel="noopener noreferrer"
          className="gb-header-icon-btn"
          style={{ color: 'var(--color-primary)' }}
          title="이용권 구매"
        >
          <WonCircle style={{ width: 16, height: 16 }} />
        </a>

        {/* 알림 */}
        <button className="gb-header-icon-btn" title="알림">
          <Bell style={{ width: 16, height: 16 }} />
        </button>

        {/* 계정연동 */}
        <a
          href={`${config.hubUrl}/account-linkage`}
          target="_blank"
          rel="noopener noreferrer"
          className="gb-header-icon-btn"
          title="계정연동"
        >
          <Users style={{ width: 16, height: 16 }} />
        </a>

        {/* 사용자 드롭다운 */}
        <div className="gb-header-user-wrap">
          <button
            className="gb-header-user-trigger"
            onClick={() => setUserOpen(!userOpen)}
          >
            <span>선생님</span>
            <ChevronDown style={{ width: 14, height: 14 }} />
          </button>
          {userOpen && (
            <>
              <div className="gb-header-user-backdrop" onClick={() => setUserOpen(false)} />
              <div className="gb-header-user-popover">
                <a href={`${config.hubUrl}/users/profile`} target="_blank" rel="noopener noreferrer">마이 페이지</a>
                <a href={`${config.hubUrl}/users/payment`} target="_blank" rel="noopener noreferrer">결제내역</a>
                <div className="gb-header-user-popover-divider" />
                <button className="gb-logout-btn" onClick={() => { setUserOpen(false); /* TODO: logout */ }}>로그아웃</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
