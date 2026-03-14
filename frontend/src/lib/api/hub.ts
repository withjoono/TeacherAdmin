/**
 * Hub API Client
 * Hub 백엔드 (중앙 SSO 서버)에 직접 요청
 * 동일한 JWT 토큰을 사용하여 인증
 */

import axios from 'axios';
import { config } from '../config';
import { tokenManager } from './client';

export const hubApiClient = axios.create({
  baseURL: config.hubApiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request 인터셉터: 동일한 토큰 사용
hubApiClient.interceptors.request.use((reqConfig) => {
  const token = tokenManager.getAccessToken();
  if (token && reqConfig.headers) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

// ===== Mentoring (계정 연동) =====

export interface LinkedAccount {
  linkId: number;
  partnerId: string;
  partnerName: string;
  partnerType: string;
  linkedAt: string;
}

/**
 * 연동된 계정 목록 조회 (Hub 백엔드)
 */
export async function getLinkedAccounts(): Promise<LinkedAccount[]> {
  const response = await hubApiClient.get('/mentoring/links');
  return response.data;
}

/**
 * 연동 해제
 */
export async function unlinkAccount(linkId: number): Promise<void> {
  await hubApiClient.delete(`/mentoring/links/${linkId}`);
}
