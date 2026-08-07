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
