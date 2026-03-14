'use client';

import { useEffect, useState } from 'react';
import { processSSOLogin } from '@/lib/sso';
import { useAuthStore } from '@/lib/auth';

export function SSOListener() {
    const [isSSOLoading, setIsSSOLoading] = useState(() => {
        if (typeof window === 'undefined') return false;
        const params = new URLSearchParams(window.location.search);
        return !!params.get('sso_code');
    });

    useEffect(() => {
        processSSOLogin().then((tokens) => {
            if (tokens) {
                console.log('[SSO] 로그인 성공');
                // useAuthStore에 토큰 동기화
                useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken);
                window.location.reload();
            }
            setIsSSOLoading(false);

            // DEV 모드: Hub SSO 없이 테스트 가능하도록 자동 인증
            if (process.env.NODE_ENV === 'development' && !tokens && !useAuthStore.getState().isAuthenticated) {
                console.info('[DEV] 개발 모드 자동 인증 활성화');
                useAuthStore.getState().setTokens('dev-mock-token', 'dev-mock-refresh');
            }
        });
    }, []);

    if (!isSSOLoading) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(4px)',
        }}>
            <div style={{
                fontSize: '2.5rem',
                marginBottom: '1rem',
                animation: 'spin 1.2s linear infinite',
            }}>⏳</div>
            <p style={{
                fontSize: '1.1rem',
                color: '#374151',
                fontWeight: 500,
            }}>자동 로그인 중입니다...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

