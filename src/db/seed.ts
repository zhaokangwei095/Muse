import { getDb } from './database';
import { CURRENT_USER_ID } from '../constants';
import {
  CURRENT_USER,
  CREATOR_ELENA_RIVERA,
  INITIAL_POSTS,
  EXPLORE_CARDS,
  INITIAL_MESSAGES,
  INITIAL_BOOKMARKS,
} from '../data/mockData';

export function seedDatabase(): void {
  const db = getDb();

  // Seed inspiration calendar history independently (works on existing DBs too)
  seedActivityHistory(db);
  // Seed chat conversations independently (works on existing DBs too)
  seedConversations(db);

  // Check if already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  if (userCount.count > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database with initial data...');

  // Collect all unique users from mock data
  const usersMap = new Map<string, typeof CURRENT_USER>();
  usersMap.set(CURRENT_USER.id, CURRENT_USER);
  usersMap.set(CREATOR_ELENA_RIVERA.id, CREATOR_ELENA_RIVERA);

  for (const post of [...INITIAL_POSTS, ...EXPLORE_CARDS]) {
    if (!usersMap.has(post.author.id)) {
      usersMap.set(post.author.id, post.author);
    }
  }

  // Insert users
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, handle, avatar, bio, posts_count, followers_count, following_count, active_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const user of usersMap.values()) {
    insertUser.run(
      user.id,
      user.name,
      user.handle,
      user.avatar,
      user.bio || '',
      user.postsCount,
      user.followersCount,
      user.followingCount,
      user.activeStatus || ''
    );
  }

  // Insert posts (from INITIAL_POSTS and EXPLORE_CARDS)
  const insertPost = db.prepare(`
    INSERT OR IGNORE INTO posts (id, author_id, title, content, image_url, quote, category, tags, likes_count, comments_count, reads, date, type, gallery_images)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const post of [...INITIAL_POSTS, ...EXPLORE_CARDS]) {
    insertPost.run(
      post.id,
      post.author.id,
      post.title,
      post.content || '',
      post.imageUrl || '',
      post.quote || '',
      post.category,
      JSON.stringify(post.tags),
      post.likes,
      post.commentsCount || 0,
      post.reads || '',
      post.date || '',
      post.type || 'standard',
      JSON.stringify(post.galleryImages || [])
    );
  }

  // Insert messages
  const insertMessage = db.prepare(`
    INSERT OR IGNORE INTO messages (id, sender, text, timestamp)
    VALUES (?, ?, ?, ?)
  `);

  for (const msg of INITIAL_MESSAGES) {
    insertMessage.run(msg.id, msg.sender, msg.text, msg.timestamp);
  }

  // Insert bookmarks
  const insertBookmark = db.prepare(`
    INSERT OR IGNORE INTO bookmarks (id, user_id, title, category, source, image_url, tags, excerpt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const bm of INITIAL_BOOKMARKS) {
    insertBookmark.run(
      bm.id,
      CURRENT_USER.id,
      bm.title,
      bm.category,
      bm.source,
      bm.imageUrl,
      JSON.stringify(bm.tags),
      bm.excerpt || ''
    );
  }

  // Insert some default comments for post_3
  const insertComment = db.prepare(`
    INSERT OR IGNORE INTO comments (id, post_id, author_name, text)
    VALUES (?, ?, ?, ?)
  `);

  insertComment.run('comment_1', 'post_3', 'Community Member', 'Incredible perspective on spatial design!');
  insertComment.run('comment_2', 'post_3', 'Community Member', 'The photography in this piece is so calming.');

  console.log('Database seeded successfully!');
}

// Seed chat conversations; safe to run against existing databases
function seedConversations(db: ReturnType<typeof getDb>): void {
  const count = db.prepare('SELECT COUNT(*) as count FROM conversations').get() as any;
  if (count.count > 0) return;

  console.log('Seeding chat conversations...');
  const insertConversation = db.prepare(`
    INSERT OR IGNORE INTO conversations (id, contact_id, last_text, updated_at)
    VALUES (?, ?, ?, datetime('now', ?))
  `);
  insertConversation.run('c_elena', 'user_2', INITIAL_MESSAGES[0]?.text || '', '-2 minutes');
  insertConversation.run('c_mia', 'user_mia', '你的极简系列太打动我了，有空聊聊创作呀 ✨', '-3 hours');
  insertConversation.run('c_cafe', 'cafe_life', '嗨！你收藏的那篇手冲咖啡指南我也超喜欢～', '-1 day');

  const insertMsg = db.prepare(`
    INSERT OR IGNORE INTO messages (id, sender, text, timestamp, conversation_id)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertMsg.run('msg_mia_1', 'other', '你的极简系列太打动我了，有空聊聊创作呀 ✨', '09:20 AM', 'c_mia');
  insertMsg.run('msg_cafe_1', 'other', '嗨！你收藏的那篇手冲咖啡指南我也超喜欢～', 'Yesterday', 'c_cafe');
}

// Deterministic pseudo-random generator so the calendar history is stable
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function seedActivityHistory(db: ReturnType<typeof getDb>): void {
  const count = db.prepare('SELECT COUNT(*) as count FROM activity').get() as any;
  if (count.count > 0) return;

  console.log('Seeding inspiration calendar history...');
  const rand = lcg(20260806);
  const insert = db.prepare(`
    INSERT OR IGNORE INTO activity (date, user_id, posts_count, likes_count)
    VALUES (?, ?, ?, ?)
  `);

  const today = new Date();
  // 14 weeks of history, excluding today (real data accumulates there)
  for (let i = 98; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const weekday = d.getDay();
    const isWeekend = weekday === 0 || weekday === 6;

    // Creative rhythm: active ~60% of days, more on weekends, streaks
    const activeChance = isWeekend ? 0.75 : 0.55;
    if (rand() > activeChance) {
      insert.run(dateStr, CURRENT_USER_ID, 0, 0);
      continue;
    }

    const posts = isWeekend ? Math.floor(rand() * 3) : Math.floor(rand() * 2);
    const baseLikes = Math.floor(rand() * 18);
    const bonus = posts > 0 ? Math.floor(rand() * 14) : 0;
    insert.run(dateStr, CURRENT_USER_ID, posts, baseLikes + bonus);
  }
}
