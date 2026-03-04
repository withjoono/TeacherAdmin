/**
 * 환경 변수 및 설정 관리
 */
const isDev = import.meta.env.DEV;

export const config = {
  // Teacher Backend API URL
  apiUrl: import.meta.env.VITE_API_URL || '/api',

  // Hub SSO URLs
  hubUrl: import.meta.env.VITE_HUB_URL || 'http://localhost:3000',
  hubApiUrl: import.meta.env.VITE_HUB_API_URL || 'http://localhost:4000',

  // 환경
  isDevelopment: isDev,
  isProduction: !isDev,
} as const;

export default config;
