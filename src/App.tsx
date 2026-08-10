import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/Toast';

import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { EditProfileModal } from './components/EditProfileModal';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';

import { DiscoveryFeedView } from './views/DiscoveryFeedView';
import { ExploreSwipeView } from './views/ExploreSwipeView';
import { ExploreTabView } from './views/ExploreTabView';
import { ProfileView } from './views/ProfileView';
import { MessagesView } from './views/MessagesView';
import { CreatePostView } from './views/CreatePostView';
import { BookmarksView } from './views/BookmarksView';
import { ArticleDetailView } from './views/ArticleDetailView';
import { SettingsView } from './views/SettingsView';
import { WelcomeAuthView } from './views/WelcomeAuthView';
import { CREATOR_ELENA_RIVERA } from './data/mockData';

function AppContent() {
  const {
    currentTab, setCurrentTab,
    isDarkMode, toggleDarkMode,
    isMobile,
    exploreMode, toggleExploreMode, setExploreMode,
    user, posts, exploreCards, messages, bookmarks,
    selectedPost, setSelectedPost,
    isReplying, isLoading,
    toggleLike, toggleSave, publishPost,
    sendMessage, removeBookmark, updateUser,
  } = useApp();

  const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Nav click: tapping the active Explore tab toggles feed/cards mode
  const handleNavTab = (tab: Parameters<typeof setCurrentTab>[0]) => {
    if (tab === 'explore' && currentTab === 'explore' && !selectedPost) {
      toggleExploreMode();
      return;
    }
    setSelectedPost(null);
    setCurrentTab(tab);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f8f9ff] dark:bg-[#0b1c30]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#0058be] to-[#2170e4] mx-auto mb-4 animate-pulse flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[32px]">bubble_chart</span>
          </div>
          <p className="font-headline text-xl font-bold text-[#0058be] dark:text-[#adc6ff] animate-pulse">
            Loading Muse...
          </p>
        </div>
      </div>
    );
  }

  if (currentTab === 'auth') {
    return <WelcomeAuthView onSuccessAuth={() => setCurrentTab('discovery')} />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#0b1c30] text-[#0b1c30] dark:text-gray-100 transition-colors selection:bg-[#2170e4]/20 relative">
      <ToastContainer />

      <Header
        currentTab={currentTab}
        onTabChange={handleNavTab}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenSettings={() => setCurrentTab('settings')}
        isMobile={isMobile}
        onOpenMenu={() => setIsMenuOpen(true)}
        onToggleExploreMode={toggleExploreMode}
      />

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPost ? `detail-${selectedPost.id}` : `tab-${currentTab}`}
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.99 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {selectedPost ? (
          <ArticleDetailView
            post={selectedPost}
            onBack={() => setSelectedPost(null)}
            onToggleLike={toggleLike}
            onToggleSave={toggleSave}
          />
        ) : (
          <>
            {currentTab === 'discovery' && (
              <DiscoveryFeedView
                posts={posts}
                onSelectPost={(post) => setSelectedPost(post)}
                onToggleLike={toggleLike}
                onToggleSave={toggleSave}
              />
            )}
            {currentTab === 'explore' && (
              isMobile ? (
                <ExploreTabView
                  posts={posts}
                  cards={exploreCards}
                  mode={exploreMode}
                  onModeChange={setExploreMode}
                  onSelectPost={(post) => setSelectedPost(post)}
                  onToggleLike={toggleLike}
                  onToggleSave={toggleSave}
                  onOpenMessagesWithAuthor={() => setCurrentTab('messages')}
                />
              ) : (
                <ExploreSwipeView
                  cards={exploreCards}
                  onSelectPost={(post) => setSelectedPost(post)}
                  onOpenMessagesWithAuthor={() => setCurrentTab('messages')}
                />
              )
            )}
            {currentTab === 'create' && user && (
              <CreatePostView
                currentUser={user}
                onPublishPost={publishPost}
                onCancel={() => setCurrentTab('discovery')}
              />
            )}
            {currentTab === 'messages' && (
              <MessagesView
                recipient={CREATOR_ELENA_RIVERA}
                messages={messages}
                onSendMessage={sendMessage}
                isReplying={isReplying}
              />
            )}
            {currentTab === 'bookmarks' && (
              <BookmarksView
                bookmarks={bookmarks}
                onSelectBookmark={(bm) => {
                  const matched = posts.find((p) => p.title.includes(bm.title) || p.category === bm.category);
                  if (matched) setSelectedPost(matched);
                }}
                onRemoveBookmark={removeBookmark}
              />
            )}
            {currentTab === 'profile' && user && (
              <ProfileView
                user={user}
                userPosts={posts.filter((p) => p.author.name === user.name)}
                onOpenEditProfile={() => setIsEditProfileOpen(true)}
                onOpenSettings={() => setCurrentTab('settings')}
                onSelectPost={(post) => setSelectedPost(post)}
              />
            )}
            {currentTab === 'settings' && (
              <SettingsView
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                onOpenAuth={() => setCurrentTab('auth')}
                onBack={() => setCurrentTab('discovery')}
              />
            )}
          </>
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      {!selectedPost && currentTab !== 'settings' && isMobile && (
        <BottomNavBar
          currentTab={currentTab}
          onTabChange={handleNavTab}
        />
      )}

      {user && (
        <EditProfileModal
          user={user}
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={(updatedUser) => updateUser(updatedUser)}
        />
      )}

      {/* Mobile Side Drawer Menu */}
      <MobileMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        currentTab={currentTab}
        onTabChange={(tab) => { setSelectedPost(null); setCurrentTab(tab); }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
