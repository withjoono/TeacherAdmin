const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:3000';
const HUB_API_URL = process.env.NEXT_PUBLIC_HUB_API_URL || 'http://localhost:4000';
const SERVICE_ID = 'teacheradmin';

export function redirectToHubLogin() {
    const currentUrl = window.location.href;
    window.location.href = `${HUB_URL}/auth/login?redirect=${encodeURIComponent(currentUrl)}`;
}

/**
 * SSO 코드를 Hub Backend에 직접 전송하여 토큰 교환
 */
export async function processSSOLogin(): Promise<boolean> {
    const params = new URLSearchParams(window.location.search);
    const ssoCode = params.get('sso_code');

    if (!ssoCode) return false;

    try {
        const response = await fetch(`${HUB_API_URL}/auth/sso/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: ssoCode, serviceId: SERVICE_ID }),
        });

        if (!response.ok) return false;

        const result = await response.json();
        const data = result.data || result;

        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }

            // Clean up URL
            const url = new URL(window.location.href);
            url.searchParams.delete('sso_code');
            window.history.replaceState({}, '', url.toString());
            return true;
        }
    } catch (e) {
        console.warn('[SSO] Exchange failed:', e);
    }

    return false;
}
