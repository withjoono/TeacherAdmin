/**
 * Hub Comment API Client
 * Hub-Backend의 중앙 코멘트 API를 호출하기 위한 클라이언트
 */

import axios from 'axios';
import { config } from '../config';
import { tokenManager } from './client';

/** Hub API 클라이언트 (Hub-Backend에 접속) */
const hubClient = axios.create({
  baseURL: config.hubApiUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 토큰 주입 (동일 SSO 토큰 사용)
hubClient.interceptors.request.use((req) => {
  const token = tokenManager.getAccessToken();
  if (token && req.headers) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// === Types ===

export interface HubComment {
  id: number;
  authorId: string;
  authorRole: string;
  targetId: string;
  sourceApp: string;
  contextType: string | null;
  contextLabel: string | null;
  contextUrl: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
  author: {
    id: string;
    nickname: string;
    member_type: string;
  } | null;
}

// === API Functions ===

/** 코멘트 작성 */
export async function createHubComment(data: {
  target_id: string;
  content: string;
  source_app?: string;
  context_type?: string;
  context_label?: string;
  context_url?: string;
}): Promise<HubComment> {
  const res = await hubClient.post('/hub-comments', data);
  return res.data?.data;
}

/** 특정 학생과의 대화 조회 */
export async function getHubConversation(
  partnerId: string,
  limit = 50,
  offset = 0,
): Promise<{ comments: HubComment[]; total: number }> {
  const res = await hubClient.get(
    `/hub-comments/conversation/${partnerId}?limit=${limit}&offset=${offset}`,
  );
  return res.data?.data;
}

/** 대화 전체 읽음 처리 */
export async function markAllHubCommentsRead(partnerId: string) {
  const res = await hubClient.patch(`/hub-comments/read-all/${partnerId}`);
  return res.data?.data;
}
