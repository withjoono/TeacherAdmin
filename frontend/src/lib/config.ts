/**
 * 환경 변수 및 설정 관리
 */

const isDev = process.env.NODE_ENV === 'development';

export const config = {
  // TutorBoard Backend API URL
  apiUrl: process.env.NEXT_PUBLIC_API_URL || (isDev ? 'http://localhost:4019' : ''),

  // Frontend URL
  frontUrl: process.env.NEXT_PUBLIC_FRONT_URL || (isDev ? 'http://localhost:3019' : ''),

  // Hub SSO URLs
  hubUrl: process.env.NEXT_PUBLIC_HUB_URL || (isDev ? 'http://localhost:3000' : 'https://www.tskool.kr'),
  hubApiUrl: process.env.NEXT_PUBLIC_HUB_API_URL || (isDev ? 'http://localhost:4000' : 'https://ts-back-nest-479305.du.r.appspot.com'),

  // 연동 앱 URL 매핑
  appUrls: {
    studyplanner: isDev ? 'http://localhost:3004' : 'https://studyplanner-new.web.app',
    examhub: isDev ? 'http://localhost:3003' : 'https://examhub-app.web.app',
    mysanggibu: isDev ? 'http://localhost:3005' : 'https://ms-front.web.app',
    susi: isDev ? 'http://localhost:3001' : 'https://susi-front.web.app',
    jungsi: isDev ? 'http://localhost:3002' : 'https://jungsi-front.web.app',
  } as Record<string, string>,

  // 환경
  isDevelopment: isDev,
  isProduction: !isDev,
} as const;

export default config;





























