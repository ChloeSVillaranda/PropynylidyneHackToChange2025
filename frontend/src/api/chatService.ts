import { apiConfig, getAuthHeaders } from './config';
import { ChatMessage } from '../types';

const defaultRoomId = 'global';

export type PostChatMessageRequest = {
  roomId?: string;
  author?: string;
  text: string;
};

export const chatService = {
  async listMessages(params?: { roomId?: string; limit?: number; since?: string }): Promise<ChatMessage[]> {
    const query = new URLSearchParams();
    const roomId = params?.roomId ?? defaultRoomId;
    if (roomId) {
      query.append('roomId', roomId);
    }
    if (params?.limit) {
      query.append('limit', params.limit.toString());
    }
    if (params?.since) {
      query.append('since', params.since);
    }

    const response = await fetch(`${apiConfig.baseURL}/chat?${query.toString()}`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat messages');
    }

    const result = await response.json();
    if (Array.isArray(result?.data)) {
      return result.data;
    }
    if (Array.isArray(result)) {
      return result;
    }
    return [];
  },

  async postMessage(payload: PostChatMessageRequest): Promise<ChatMessage> {
    const response = await fetch(`${apiConfig.baseURL}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        roomId: payload.roomId ?? defaultRoomId,
        author: payload.author?.trim() || undefined,
        text: payload.text,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Chat message post failed:', response.status, text);
      throw new Error('Failed to send message');
    }

    const result = await response.json();
    return result?.data ?? result;
  },
};


