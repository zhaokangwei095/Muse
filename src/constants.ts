// Centralized constants for the Muse application

export const CATEGORIES = ['推荐', 'AI科技', '生活', '艺术设计', '摄影', '旅行', '观点'] as const;

export const POST_CATEGORIES = ['生活', 'AI科技', '艺术设计', '摄影', '旅行', '观点'] as const;

export const BOOKMARK_CATEGORIES = ['All', 'Architecture', 'Food & Drink', 'Travel', 'Design'] as const;

export const CURRENT_USER_ID = 'user_1';

export const API = {
  POSTS: '/api/posts',
  POST_LIKE: (id: string) => `/api/posts/${id}/like`,
  POST_SAVE: (id: string) => `/api/posts/${id}/save`,
  POST_COMMENTS: (id: string) => `/api/posts/${id}/comments`,
  MESSAGES: '/api/messages',
  BOOKMARKS: '/api/bookmarks',
  CONVERSATIONS: '/api/conversations',
  USER: '/api/user',
  AI_INSPIRE: '/api/ai/generate-inspiration',
  AI_CHAT: '/api/ai/chat-reply',
} as const;
