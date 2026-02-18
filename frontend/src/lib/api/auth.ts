/**
 * Authentication API
 */

import axios from 'axios';
import { config } from '../config';
import { publicClient, tokenManager } from './client';

// ==================== Types ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  member: {
    id: number;
    email: string;
    name: string;
    memberType?: string;
    roles: string[];
  };
}

export interface User {
  id: number;
  email: string;
  name: string;
  memberType?: string;
  roles: string[];
}

// ==================== API Functions ====================

// 토큰 관리자 재내보내기 (컴포넌트에서 사용)
export { tokenManager };
export const setTokens = tokenManager.setTokens;
export const clearTokens = tokenManager.clearTokens;

/**
 * 이메일 로그인
 */
export const loginWithEmail = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await publicClient.post('/auth/login-with-email', data);
  const { accessToken, refreshToken, member } = response.data.data;

  // 토큰 저장
  tokenManager.setTokens(accessToken, refreshToken);

  return { accessToken, refreshToken, member };
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<void> => {
  try {
    // Hub 로그아웃 호출 (선택사항, 토큰만 지워도 됨)
    // await publicClient.post('/auth/logout');
  } finally {
    // 토큰 삭제
    tokenManager.clearTokens();
    removeUser();
  }
};

/**
 * 현재 사용자 정보 조회
 */
export const getCurrentUser = async (): Promise<User | null> => {
  if (!tokenManager.hasTokens()) {
    return null;
  }

  try {
    // Hub API를 통해 사용자 정보 조회
    const token = tokenManager.getAccessToken();
    const response = await axios.get(`${config.hubApiUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data && response.data.data) {
      const user = response.data.data;
      saveUser(user);
      return user;
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    // 401이면 로그아웃 처리
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      tokenManager.clearTokens();
      removeUser();
    }
    return null;
  }
};

/**
 * 사용자 정보 저장 (로컬)
 */
export const saveUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

/**
 * 사용자 정보 삭제 (로컬)
 */
export const removeUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};




























