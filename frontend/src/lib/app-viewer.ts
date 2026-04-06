/**
 * 학생 앱 뷰어 유틸리티
 * 선생님이 연동된 학생의 앱을 viewAs 모드로 열기 위한 URL 생성
 */

import { config } from './config';
import { getAccessToken, getRefreshToken } from 'geobuk-shared/auth';

/** 앱 표시 라벨 */
export const APP_LABELS: Record<string, { emoji: string; name: string }> = {
  studyplanner: { emoji: '📅', name: 'StudyPlanner' },
  examhub: { emoji: '📝', name: 'ExamHub' },
  mysanggibu: { emoji: '📋', name: '내생기부' },
  susi: { emoji: '📂', name: '수시플래너' },
  jungsi: { emoji: '🎯', name: '정시계산기' },
};

/**
 * viewAs URL 생성
 * 선생님 SSO 토큰 + viewAs=학생ID 를 포함한 URL
 */
export function generateViewAsUrl(appKey: string, studentHubId: string): string | null {
  const baseUrl = config.appUrls[appKey];
  if (!baseUrl) return null;

  const url = new URL(baseUrl);
  url.searchParams.set('viewAs', studentHubId);

  // SSO 토큰 주입 (선생님 세션 유지)
  if (typeof window !== 'undefined') {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    if (accessToken) url.searchParams.set('sso_access_token', accessToken);
    if (refreshToken) url.searchParams.set('sso_refresh_token', refreshToken);
  }

  return url.toString();
}

/**
 * 앱을 새 탭으로 열기
 */
export function openStudentApp(appKey: string, studentHubId: string): void {
  const url = generateViewAsUrl(appKey, studentHubId);
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
