import { getDb } from './database';
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
