import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NavTab, PostItem, User, DirectMessage, BookmarkCollection, Conversation, AppNotification } from '../types';
import { CREATOR_ELENA_RIVERA } from '../data/mockData';
import { loadOrCreateGuest } from '../data/guestIdentity';
import { api } from '../services/api';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  // State
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isMobile: boolean;
  exploreMode: 'feed' | 'cards';
  toggleExploreMode: () => void;
  setExploreMode: (mode: 'feed' | 'cards') => void;
  user: User | null;
  posts: PostItem[];
  exploreCards: PostItem[];
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  messages: DirectMessage[];
  bookmarks: BookmarkCollection[];
  selectedPost: PostItem | null;
  setSelectedPost: (post: PostItem | null) => void;
  isReplying: boolean;
  isLoading: boolean;
  toasts: Toast[];
  followedIds: string[];
  notifications: AppNotification[];
  unreadCount: number;
  favTags: string[];
  cardAlbumOpen: boolean;
  setCardAlbumOpen: (open: boolean) => void;

  // Actions
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  publishPost: (data: { title: string; content?: string; imageUrl?: string; category: string; tags: string[] }) => Promise<void>;
  sendMessage: (text: string, image?: string) => Promise<void>;
  removeBookmark: (id: string) => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  refreshPosts: () => Promise<void>;
  toggleFollow: (targetId: string) => Promise<boolean>;
  markNotificationsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  toggleFavTag: (key: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentTab, setCurrentTab] = useState<NavTab>('discovery');
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Mobile mode: forced via ?mobile=1 / ?mobile=0 (persisted), otherwise real viewport detection
  const [isMobile, setIsMobile] = useState(() => {
    const forced = localStorage.getItem('muse-force-mobile');
    if (forced === '1') return true;
    if (forced === '0') return false;
    return typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  });
  // Explore tab sub-mode: waterfall feed or swipe cards (toggled via nav buttons)
  const [exploreMode, setExploreMode] = useState<'feed' | 'cards'>('feed');
  const toggleExploreMode = useCallback(() => {
    setExploreMode((prev) => (prev === 'feed' ? 'cards' : 'feed'));
  }, []);
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [exploreCards, setExploreCards] = useState<PostItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkCollection[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [favTags, setFavTags] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('muse-fav-tags') || '[]'); } catch { return []; }
  });
  const [cardAlbumOpen, setCardAlbumOpen] = useState(false);

  // Toast system
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Handle ?mobile=1 / ?mobile=0 query param + live viewport tracking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const param = params.get('mobile');
    if (param === '1') {
      localStorage.setItem('muse-force-mobile', '1');
      setIsMobile(true);
      params.delete('mobile');
      window.history.replaceState(null, '', window.location.pathname + (params.toString() ? `?${params}` : ''));
      return;
    }
    if (param === '0') {
      localStorage.setItem('muse-force-mobile', '0');
      setIsMobile(false);
      params.delete('mobile');
      window.history.replaceState(null, '', window.location.pathname + (params.toString() ? `?${params}` : ''));
      return;
    }
    // No forced setting: follow real viewport
    if (localStorage.getItem('muse-force-mobile')) return;
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Dark mode + forced mobile class sync to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.classList.toggle('force-mobile', isMobile && window.innerWidth >= 768);
  }, [isDarkMode, isMobile]);

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);

  // Load initial data from API
  useEffect(() => {
    async function loadData() {
      try {
        // Guest identity: personalize the demo user on first visit
        const { profile, created } = loadOrCreateGuest();

        const [userData, postsData, exploreData, conversationsData, bookmarksData, followingData, notificationsData] = await Promise.all([
          api.getUser(),
          api.getPosts(),
          api.getExploreCards(),
          api.getConversations(),
          api.getBookmarks(),
          api.getFollowing(),
          api.getNotifications(),
        ]);

        // Sync freshly created guest profile into the backend user record
        if (created || userData.name !== profile.name) {
          api.updateUser({ name: profile.name, handle: profile.handle, avatar: profile.avatar }).catch(() => {});
          setUser({ ...userData, name: profile.name, handle: profile.handle, avatar: profile.avatar });
          if (created) showToast(`欢迎来到 Muse，${profile.name} ✨`, 'success');
        } else {
          setUser(userData);
        }

        setPosts(postsData);
        setExploreCards(exploreData);
        setConversations(conversationsData);
        setBookmarks(bookmarksData);
        setFollowedIds(followingData);
        setNotifications(notificationsData);
      } catch (err) {
        console.error('Failed to load data:', err);
        showToast('Failed to load data. Please refresh.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Load messages whenever a conversation is opened
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    api.getMessages(activeConversationId).then(setMessages).catch(() => {});
  }, [activeConversationId]);

  const refreshPosts = useCallback(async () => {
    try {
      const data = await api.getPosts();
      setPosts(data);
    } catch (err) {
      console.error('Failed to refresh posts:', err);
    }
  }, []);

  const toggleLike = useCallback(async (postId: string) => {
    try {
      const updated = await api.toggleLike(postId);
      setPosts(prev => prev.map(p => p.id === postId ? updated : p));
      if (selectedPost?.id === postId) {
        setSelectedPost(updated);
      }
    } catch (err) {
      showToast('Failed to update like', 'error');
    }
  }, [selectedPost, showToast]);

  const toggleSave = useCallback((postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isSaved: !p.isSaved } : p));
    if (selectedPost?.id === postId) {
      setSelectedPost(prev => prev ? { ...prev, isSaved: !prev.isSaved } : null);
    }
  }, [selectedPost]);

  const publishPost = useCallback(async (data: { title: string; content?: string; imageUrl?: string; category: string; tags: string[] }) => {
    try {
      const newPost = await api.createPost(data);
      setPosts(prev => [newPost, ...prev]);
      setUser(prev => prev ? { ...prev, postsCount: prev.postsCount + 1 } : prev);
      setCurrentTab('discovery');
      showToast('Post published!', 'success');
    } catch (err) {
      showToast('Failed to publish post', 'error');
      throw err;
    }
  }, [showToast]);

  const sendMessage = useCallback(async (text: string, image?: string) => {
    const conversationId = activeConversationId || 'c_elena';
    const persona = conversations.find((c) => c.id === conversationId)?.contact || CREATOR_ELENA_RIVERA;
    try {
      const userMsg = await api.sendMessage(text, image, conversationId);
      setMessages((prev) => [...prev, userMsg]);
      setIsReplying(true);

      try {
        const { reply } = await api.chatReply(persona, text);
        const savedReply = await api.saveReply(reply || "Thanks for reaching out!", conversationId, persona.name);
        setMessages((prev) => [...prev, savedReply]);
      } catch {
        // Fallback if AI is not configured
        const fallback = await api.saveReply("Thanks for your note! I'd love to chat more soon.", conversationId);
        setMessages((prev) => [...prev, fallback]);
      }

      // Bump conversation preview to the top
      setConversations((prev) => {
        const bumped = prev.map((c) =>
          c.id === conversationId
            ? { ...c, lastText: text.trim() || '[图片]', updatedAt: new Date().toISOString() }
            : c
        );
        return bumped.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      });
    } catch (err) {
      showToast('Failed to send message', 'error');
    } finally {
      setIsReplying(false);
    }
  }, [activeConversationId, conversations, showToast]);

  const removeBookmark = useCallback(async (id: string) => {
    try {
      await api.removeBookmark(id);
      setBookmarks(prev => prev.filter(b => b.id !== id));
      showToast('Bookmark removed', 'success');
    } catch (err) {
      showToast('Failed to remove bookmark', 'error');
    }
  }, [showToast]);

  const updateUser = useCallback(async (data: Partial<User>) => {
    try {
      const updated = await api.updateUser(data);
      setUser(updated);
      showToast('Profile updated!', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'error');
    }
  }, [showToast]);

  const addComment = useCallback(async (postId: string, text: string) => {
    try {
      await api.addComment(postId, text);
      showToast('Comment added!', 'success');
    } catch (err) {
      showToast('Failed to add comment', 'error');
    }
  }, [showToast]);

  // Follow / unfollow an author
  const toggleFollow = useCallback(async (targetId: string): Promise<boolean> => {
    try {
      const { isFollowing } = await api.toggleFollow(targetId);
      setFollowedIds((prev) =>
        isFollowing ? Array.from(new Set([...prev, targetId])) : prev.filter((id) => id !== targetId)
      );
      showToast(isFollowing ? '已关注 ✓' : '已取消关注', 'success');
      return isFollowing;
    } catch {
      showToast('操作失败，请重试', 'error');
      return false;
    }
  }, [showToast]);

  // Notifications
  const refreshNotifications = useCallback(async () => {
    try {
      setNotifications(await api.getNotifications());
    } catch {
      // silent
    }
  }, []);

  const markNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try { await api.markNotificationsRead(); } catch { /* silent */ }
  }, []);

  // Long-pressed favorite tags (persisted locally)
  const toggleFavTag = useCallback((key: string) => {
    setFavTags((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      localStorage.setItem('muse-fav-tags', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      currentTab, setCurrentTab,
      isDarkMode, toggleDarkMode,
      isMobile,
      exploreMode, toggleExploreMode, setExploreMode,
      user, posts, exploreCards, conversations, activeConversationId, setActiveConversationId, messages, bookmarks,
      selectedPost, setSelectedPost,
      isReplying, isLoading, toasts,
      followedIds, notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
      favTags, cardAlbumOpen, setCardAlbumOpen,
      showToast, toggleLike, toggleSave, publishPost,
      sendMessage, removeBookmark, updateUser, addComment, refreshPosts,
      toggleFollow, markNotificationsRead, refreshNotifications, toggleFavTag,
    }}>
      {children}
    </AppContext.Provider>
  );
}
