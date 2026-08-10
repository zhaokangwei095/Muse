-- Muse Database Schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  avatar TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  posts_count INTEGER DEFAULT 0,
  followers_count TEXT DEFAULT '0',
  following_count INTEGER DEFAULT 0,
  active_status TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  quote TEXT DEFAULT '',
  category TEXT DEFAULT '',
  tags TEXT DEFAULT '[]',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reads TEXT DEFAULT '',
  date TEXT DEFAULT '',
  type TEXT DEFAULT 'standard',
  aspect_height TEXT DEFAULT '',
  gallery_images TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS likes (
  user_id TEXT NOT NULL,
  post_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT '',
  source TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  tags TEXT DEFAULT '[]',
  excerpt TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender TEXT NOT NULL CHECK(sender IN ('user', 'other')),
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  image TEXT DEFAULT '',
  conversation_id TEXT DEFAULT 'c_elena',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  last_text TEXT DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (contact_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_name TEXT DEFAULT 'Community Member',
  text TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Daily inspiration activity for the GitHub-style calendar
CREATE TABLE IF NOT EXISTS activity (
  date TEXT NOT NULL,
  user_id TEXT NOT NULL,
  posts_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  PRIMARY KEY (date, user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity(user_id);
