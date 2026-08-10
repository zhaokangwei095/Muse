import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';
import { CURRENT_USER_ID } from '../constants';

const router = Router();

// GET /api/user - Get current user
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(CURRENT_USER_ID) as any;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      handle: user.handle,
      avatar: user.avatar,
      bio: user.bio || '',
      postsCount: user.posts_count,
      followersCount: user.followers_count,
      followingCount: user.following_count,
      activeStatus: user.active_status || '',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/user/calendar - Inspiration activity calendar (last 14 weeks)
router.get('/calendar', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const days = Math.min(parseInt((req.query.days as string) || '98', 10), 365);
    const rows = db.prepare(`
      SELECT date, posts_count as postsCount, likes_count as likesCount
      FROM activity
      WHERE user_id = ? AND date >= date('now', ?)
      ORDER BY date ASC
    `).all(CURRENT_USER_ID, `-${days} days`);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/user/following - List ids the current user follows
router.get('/following', (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT target_id FROM follows WHERE user_id = ?').all(CURRENT_USER_ID) as any[];
    res.json(rows.map((r) => r.target_id));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/user/follow/:targetId - Toggle follow
router.post('/follow/:targetId', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const targetId = req.params.targetId;
    const existing = db.prepare('SELECT 1 FROM follows WHERE user_id = ? AND target_id = ?').get(CURRENT_USER_ID, targetId);
    if (existing) {
      db.prepare('DELETE FROM follows WHERE user_id = ? AND target_id = ?').run(CURRENT_USER_ID, targetId);
      res.json({ isFollowing: false });
    } else {
      db.prepare('INSERT INTO follows (user_id, target_id) VALUES (?, ?)').run(CURRENT_USER_ID, targetId);
      res.json({ isFollowing: true });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/user - Update current user profile
router.put('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { name, handle, bio, avatar } = req.body;

    db.prepare(`
      UPDATE users SET name = COALESCE(?, name), handle = COALESCE(?, handle),
        bio = COALESCE(?, bio), avatar = COALESCE(?, avatar)
      WHERE id = ?
    `).run(name, handle, bio, avatar, CURRENT_USER_ID);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(CURRENT_USER_ID) as any;
    res.json({
      id: user.id,
      name: user.name,
      handle: user.handle,
      avatar: user.avatar,
      bio: user.bio || '',
      postsCount: user.posts_count,
      followersCount: user.followers_count,
      followingCount: user.following_count,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
