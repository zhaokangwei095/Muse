// Centralized constants for the Muse application

export const CATEGORIES = ['推荐', 'AI科技', '生活', '艺术设计', '摄影', '旅行', '观点'] as const;

export const POST_CATEGORIES = ['生活', 'AI科技', '艺术设计', '摄影', '旅行', '观点'] as const;

export const BOOKMARK_CATEGORIES = ['All', 'Architecture', 'Food & Drink', 'Travel', 'Design'] as const;

export const CURRENT_USER_ID = 'user_1';

// Placeholder image shown when a remote image fails to load
export const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#dbe7ff'/><stop offset='1' stop-color='#c3d4f7'/></linearGradient></defs><rect width='400' height='300' fill='url(#g)'/><text x='200' y='162' font-size='44' text-anchor='middle'>🖼️</text></svg>`
  );

export const API = {
  POSTS: '/api/posts',
  POST_LIKE: (id: string) => `/api/posts/${id}/like`,
  POST_SAVE: (id: string) => `/api/posts/${id}/save`,
  POST_COMMENTS: (id: string) => `/api/posts/${id}/comments`,
  MESSAGES: '/api/messages',
  BOOKMARKS: '/api/bookmarks',
  CONVERSATIONS: '/api/conversations',
  NOTIFICATIONS: '/api/notifications',
  USER: '/api/user',
  AI_INSPIRE: '/api/ai/generate-inspiration',
  AI_CHAT: '/api/ai/chat-reply',
  POSTS_FOLLOWING: '/api/posts/following',
  FOLLOWING: '/api/user/following',
  FOLLOW: (id: string) => `/api/user/follow/${id}`,
  DELETE_COMMENT: (postId: string, commentId: string) => `/api/posts/${postId}/comments/${commentId}`,
} as const;
