import { config } from './config';
import { setTokens } from 'geobuk-shared/auth';

const HUB_URL = config.hubUrl;
const HUB_API_URL = config.hubApiUrl;
const SERVICE_ID = 'teacheradmin';

export function redirectToHubLogin() {
    // 로그인/회원가입 후 항상 대시보드로 리다이렉트
    const dashboardUrl = `${window.location.origin}/dashboard`;
    window.location.href = `${HUB_URL}/auth/login?redirect=${encodeURIComponent(dashboardUrl)}`;
}

/**
 * SSO 코드를 Hub Backend에 직접 전송하여 토큰 교환
 * 성공 시 토큰 객체를 반환, 실패 시 null 반환
 */
export async function processSSOLogin(): Promise<{ accessToken: string; refreshToken: string } | null> {
    const params = new URLSearchParams(window.location.search);
    const ssoCode = params.get('sso_code');

    if (!ssoCode) return null;

    try {
        const response = await fetch(`${HUB_API_URL}/auth/sso/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: ssoCode, serviceId: SERVICE_ID }),
        });

        if (!response.ok) return null;

        const result = await response.json();
        const data = result.data || result;

        if (data.accessToken) {
            setTokens(data.accessToken, data.refreshToken || '');

            // Clean up URL
            const url = new URL(window.location.href);
            url.searchParams.delete('sso_code');
            window.history.replaceState({}, '', url.toString());
            return { accessToken: data.accessToken, refreshToken: data.refreshToken || '' };
        }
    } catch (e) {
        console.warn('[SSO] Exchange failed:', e);
    }

    return null;
}
