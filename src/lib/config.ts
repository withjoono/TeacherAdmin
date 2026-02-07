/**
 * 환경 변수 및 설정 관리
 */

const isDev = process.env.NODE_ENV === 'development';

export const config = {
  // API URL
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4020',

  // Frontend URL
  frontUrl: process.env.NEXT_PUBLIC_FRONT_URL || 'http://localhost:3020',

  // 환경
  isDevelopment: isDev,
  isProduction: !isDev,
} as const;

export default config;




























