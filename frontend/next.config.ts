import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export' 는 Firebase Hosting 배포 시에만 필요
  // 로컬 개발에서는 제거해야 라우팅이 정상 동작
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
};

export default nextConfig;
