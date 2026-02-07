/**
 * Authentication API
 */

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
    await publicClient.post('/auth/logout');
  } finally {
    // 토큰 삭제
    tokenManager.clearTokens();
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
    // TODO: 백엔드에 /auth/me 엔드포인트가 있다면 사용
    // const response = await authClient.get('/auth/me');
    // return response.data.data;
    
    // 임시: localStorage에서 사용자 정보 조회
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    tokenManager.clearTokens();
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




























