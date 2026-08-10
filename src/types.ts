export type NavTab = 'discovery' | 'explore' | 'create' | 'messages' | 'bookmarks' | 'profile' | 'settings' | 'auth';

export interface User {
  id: string;
  name: string;
  avatar: string;
  handle: string;
  bio?: string;
  postsCount: number;
  followersCount: string;
  followingCount: number;
  activeStatus?: string;
  isFollowing?: boolean;
}

export interface PostItem {
  id: string;
  title: string;
  author: User;
  imageUrl?: string;
  quote?: string;
  content?: string;
  category: string;
  tags: string[];
  likes: number;
  commentsCount?: number;
  reads?: string;
  date?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  type?: 'standard' | 'large' | 'tall' | 'wide' | 'quote';
  aspectHeight?: string;
  galleryImages?: string[];
}

export interface DirectMessage {
  id: string;
  sender: 'user' | 'other';
  text: string;
  timestamp: string;
  image?: string;
}

export interface Conversation {
  id: string;
  contact: User;
  lastText: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  type: 'like' | 'comment' | 'reply' | 'follow' | string;
  actorName: string;
  text: string;
  postId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AlbumCard {
  id: string;
  colorId: string;
  colorName: string;
  gradient: string;
  title: string;
  text: string;
  tags: string[];
  category: string;
  savedAt: string;
}

export interface BookmarkCollection {
  id: string;
  title: string;
  category: string;
  source: string;
  imageUrl: string;
  tags: string[];
  excerpt?: string;
  isSaved?: boolean;
}
