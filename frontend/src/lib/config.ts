/**
 * 환경 변수 및 설정 관리
 */

const isDev = process.env.NODE_ENV === 'development';

export const config = {
  // TutorBoard Backend API URL
  apiUrl: isDev ? 'http://localhost:4019' : 'https://teacher-backend-dot-ts-back-nest-479305.du.r.appspot.com',

  // Frontend URL
  frontUrl: isDev ? 'http://localhost:3019' : 'https://teacher-front.web.app',

  // Hub SSO URLs
  hubUrl: isDev ? 'http://localhost:3000' : 'https://www.tskool.kr',
  hubApiUrl: isDev ? 'http://localhost:4000' : 'https://ts-back-nest-479305.du.r.appspot.com',

  // 연동 앱 URL 매핑
  appUrls: {
    studyplanner: isDev ? 'http://localhost:3004' : 'https://studyplanner.tskool.kr',
    examhub: isDev ? 'http://localhost:3003' : 'https://examhub.tskool.kr',
    mysanggibu: isDev ? 'http://localhost:3005' : 'https://mysanggibu.tskool.kr',
    susi: isDev ? 'http://localhost:3001' : 'https://susi.tskool.kr',
    jungsi: isDev ? 'http://localhost:3002' : 'https://jungsi.tskool.kr',
  } as Record<string, string>,

  // 환경
  isDevelopment: isDev,
  isProduction: !isDev,
} as const;

export default config;





























