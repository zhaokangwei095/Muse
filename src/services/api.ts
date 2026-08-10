import { PostItem, User, DirectMessage, BookmarkCollection, Conversation } from '../types';
import { API } from '../constants';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Posts
export const api = {
  // Get all posts (optionally filtered by category)
  getPosts: (category?: string): Promise<PostItem[]> => {
    const params = category && category !== '推荐' ? `?category=${encodeURIComponent(category)}` : '';
    return request(`${API.POSTS}${params}`);
  },

  // Get explore cards
  getExploreCards: (): Promise<PostItem[]> => request(`${API.POSTS}/explore`),

  // Create a post
  createPost: (data: { title: string; content?: string; imageUrl?: string; category: string; tags: string[] }): Promise<PostItem> =>
    request(API.POSTS, { method: 'POST', body: JSON.stringify(data) }),

  // Toggle like
  toggleLike: (postId: string): Promise<PostItem> =>
    request(API.POST_LIKE(postId), { method: 'POST' }),

  // Get comments
  getComments: (postId: string): Promise<Array<{ id: string; text: string; author_name: string; created_at: string }>> =>
    request(API.POST_COMMENTS(postId)),

  // Add comment
  addComment: (postId: string, text: string): Promise<{ id: string; text: string; authorName: string }> =>
    request(API.POST_COMMENTS(postId), { method: 'POST', body: JSON.stringify({ text }) }),

  // User
  getUser: (): Promise<User> => request(API.USER),

  // Inspiration calendar (last 14 weeks by default)
  getCalendar: (days = 98): Promise<Array<{ date: string; postsCount: number; likesCount: number }>> =>
    request(`${API.USER}/calendar?days=${days}`),

  updateUser: (data: Partial<User>): Promise<User> =>
    request(API.USER, { method: 'PUT', body: JSON.stringify(data) }),

  // Messages
  getConversations: (): Promise<Conversation[]> => request(API.CONVERSATIONS),

  getMessages: (conversationId = 'c_elena'): Promise<DirectMessage[]> =>
    request(`${API.MESSAGES}?conversation=${encodeURIComponent(conversationId)}`),

  sendMessage: (text: string, image?: string, conversationId = 'c_elena'): Promise<DirectMessage> =>
    request(API.MESSAGES, { method: 'POST', body: JSON.stringify({ text, image, conversationId }) }),

  saveReply: (text: string, conversationId = 'c_elena'): Promise<DirectMessage> =>
    request(`${API.MESSAGES}/reply`, { method: 'POST', body: JSON.stringify({ text, conversationId }) }),

  // Bookmarks
  getBookmarks: (): Promise<BookmarkCollection[]> => request(API.BOOKMARKS),

  removeBookmark: (id: string): Promise<{ success: boolean }> =>
    request(`${API.BOOKMARKS}/${id}`, { method: 'DELETE' }),

  // AI
  generateInspiration: (prompt: string): Promise<{ title: string; text: string; tags: string[]; suggestedCategory: string }> =>
    request(API.AI_INSPIRE, { method: 'POST', body: JSON.stringify({ prompt }) }),

  chatReply: (persona: User, lastMessage: string): Promise<{ reply: string }> =>
    request(API.AI_CHAT, { method: 'POST', body: JSON.stringify({ persona, lastMessage }) }),
};
