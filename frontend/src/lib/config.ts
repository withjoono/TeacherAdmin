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
  hubUrl: isDev ? 'http://localhost:3000' : 'https://www.geobukschool.kr',
  hubApiUrl: isDev ? 'http://localhost:4000' : 'https://ts-back-nest-479305.du.r.appspot.com',

  // 환경
  isDevelopment: isDev,
  isProduction: !isDev,
} as const;

export default config;





























