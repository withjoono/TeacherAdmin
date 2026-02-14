'use client';

import { useEffect } from 'react';
import { processSSOLogin } from '@/lib/sso';

export function SSOListener() {
    useEffect(() => {
        processSSOLogin().then((loggedIn) => {
            if (loggedIn) {
                console.log('[SSO] 로그인 성공');
                window.location.reload();
            }
        });
    }, []);

    return null;
}
