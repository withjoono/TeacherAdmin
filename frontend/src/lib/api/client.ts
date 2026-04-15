/**
 * API 클라이언트 설정
 * Axios 인스턴스 및 인터셉터 설정
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, hasTokens as geobukHasTokens } from 'geobuk-shared/auth';
import { config } from '../config';

/**
 * Public API Client (인증 불필요)
 * - 로그인, 회원가입 등
 */
export const publicClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Authenticated API Client (인증 필요)
 * - 모든 인증된 API 요청
 */
export const authClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 토큰 관리 함수들
export const tokenManager = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  setAccessToken: (accessToken: string) => setTokens(accessToken, ''),
  clearTokens,
  hasTokens: geobukHasTokens,
};

// Request 인터셉터: Authorization 헤더에 토큰 추가
authClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터: 토큰 만료 처리
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

authClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return authClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        // SSO 코드 교환 중이면 리다이렉트 하지 않음 (무한 루프 방지)
        const hasSSOCode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('sso_code');
        if (hasSSOCode) {
          return Promise.reject(error);
        }
        // 리프레시 토큰이 없으면 Hub SSO 로그인으로 리다이렉트
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          const { redirectToHubLogin } = await import('../sso');
          redirectToHubLogin();
        }
        return Promise.reject(error);
      }

      try {
        // Hub 백엔드에 토큰 갱신 요청 (TeacherAdmin 백엔드에는 refresh 엔드포인트 없음)
        const response = await axios.post(`${config.hubApiUrl}/auth/refresh-token`, {
          refreshToken,
        }, {
          headers: { 'Content-Type': 'application/json' },
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        tokenManager.setTokens(accessToken, newRefreshToken);

        // 대기 중인 요청들 처리
        processQueue(null, accessToken);

        // 원래 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return authClient(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시
        processQueue(refreshError, null);
        tokenManager.clearTokens();
        // SSO 코드 교환 중이면 리다이렉트 하지 않음 (무한 루프 방지)
        const hasSSOCode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('sso_code');
        if (!hasSSOCode && typeof window !== 'undefined') {
          const { redirectToHubLogin } = await import('../sso');
          redirectToHubLogin();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default { publicClient, authClient, tokenManager };




























