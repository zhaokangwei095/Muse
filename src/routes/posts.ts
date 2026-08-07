import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';
import { CURRENT_USER_ID } from '../constants';

const router = Router();

// Helper: parse a post row from DB into frontend-friendly format
function parsePostRow(row: any, userId: string = CURRENT_USER_ID) {
  const db = getDb();
  const like = db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?').get(userId, row.id);

  return {
    id: row.id,
    title: row.title,
    author: {
      id: row.author_id,
      name: row.author_name,
      handle: row.author_handle,
      avatar: row.author_avatar,
      bio: row.author_bio || '',
      postsCount: row.author_posts_count,
      followersCount: row.author_followers_count,
      followingCount: row.author_following_count,
    },
    imageUrl: row.image_url || undefined,
    quote: row.quote || undefined,
    content: row.content || undefined,
    category: row.category,
    tags: JSON.parse(row.tags || '[]'),
    likes: row.likes_count,
    commentsCount: row.comments_count || 0,
    reads: row.reads || undefined,
    date: row.date || undefined,
    isLiked: !!like,
    isSaved: false,
    type: row.type || 'standard',
    aspectHeight: row.aspect_height || undefined,
    galleryImages: JSON.parse(row.gallery_images || '[]'),
  };
}

const POST_QUERY = `
  SELECT p.*,
    u.name as author_name, u.handle as author_handle, u.avatar as author_avatar,
    u.bio as author_bio, u.posts_count as author_posts_count,
    u.followers_count as author_followers_count, u.following_count as author_following_count
  FROM posts p
  JOIN users u ON p.author_id = u.id
`;

// GET /api/posts - List all posts (with optional category filter)
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { category } = req.query;

    let query = POST_QUERY;
    const params: any[] = [];

    if (category && category !== '推荐') {
      query += ' WHERE p.category = ?';
      params.push(category);
    }

    query += ' ORDER BY p.created_at DESC';

    const rows = db.prepare(query).all(...params);
    const posts = rows.map((row: any) => parsePostRow(row));
    res.json(posts);
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/posts/explore - List explore cards
router.get('/explore', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const query = POST_QUERY + " WHERE p.id LIKE 'explore_%' ORDER BY p.created_at DESC";
    const rows = db.prepare(query).all();
    const posts = rows.map((row: any) => parsePostRow(row));
    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/posts - Create a new post
router.post('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { title, content, imageUrl, category, tags, type } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const id = `post_${Date.now()}`;
    const authorId = CURRENT_USER_ID;

    db.prepare(`
      INSERT INTO posts (id, author_id, title, content, image_url, category, tags, likes_count, comments_count, date, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 'Just now', ?)
    `).run(
      id,
      authorId,
      title.trim(),
      (content || '').trim(),
      (imageUrl || '').trim(),
      category || '',
      JSON.stringify(tags || ['#Inspiration', '#Muse']),
      type || 'standard'
    );

    // Increment user posts count
    db.prepare('UPDATE users SET posts_count = posts_count + 1 WHERE id = ?').run(authorId);

    // Fetch and return the new post
    const row = db.prepare(POST_QUERY + ' WHERE p.id = ?').get(id) as any;
    const post = parsePostRow(row);
    res.json(post);
  } catch (error: any) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/posts/:id/like - Toggle like
router.post('/:id/like', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const postId = req.params.id;
    const userId = CURRENT_USER_ID;

    const existing = db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?').get(userId, postId);

    if (existing) {
      db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(userId, postId);
      db.prepare('UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?').run(postId);
    } else {
      db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(userId, postId);
      db.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?').run(postId);
    }

    const row = db.prepare(POST_QUERY + ' WHERE p.id = ?').get(postId) as any;
    if (!row) return res.status(404).json({ error: 'Post not found' });

    const post = parsePostRow(row);
    res.json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/posts/:id/comments - Add a comment
router.post('/:id/comments', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const postId = req.params.id;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const commentId = `comment_${Date.now()}`;
    db.prepare('INSERT INTO comments (id, post_id, author_name, text) VALUES (?, ?, ?, ?)').run(
      commentId, postId, 'Community Member', text.trim()
    );
    db.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?').run(postId);

    res.json({ id: commentId, text: text.trim(), authorName: 'Community Member', createdAt: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/posts/:id/comments - Get comments for a post
router.get('/:id/comments', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const comments = db.prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
