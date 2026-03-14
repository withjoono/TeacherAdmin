"use client";

import { useState } from "react";
import { Bell, Users, ChevronDown, LogOut } from "lucide-react";
import { WonCircle } from "@/components/icons";
import { config } from "@/lib/config";

/** Hub URL에 SSO 토큰을 포함시켜 자동 로그인 지원 */
function getHubUrl(path: string): string {
  const base = `${config.hubUrl}${path}`;
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  if (!accessToken) return base;
  const url = new URL(base);
  url.searchParams.set('sso_access_token', accessToken);
  if (refreshToken) url.searchParams.set('sso_refresh_token', refreshToken);
  return url.toString();
}

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
          href={getHubUrl('/products')}
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
          href={getHubUrl('/account-linkage')}
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
                <a href={getHubUrl('/users/profile')} target="_blank" rel="noopener noreferrer">마이 페이지</a>
                <a href={getHubUrl('/users/payment')} target="_blank" rel="noopener noreferrer">결제내역</a>
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
