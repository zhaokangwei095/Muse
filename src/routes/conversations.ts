import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';

const router = Router();

// GET /api/conversations - List chat conversations with contact info
router.get('/', (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT c.id, c.last_text, c.updated_at,
        u.id as contact_id, u.name, u.handle, u.avatar, u.bio, u.active_status,
        u.posts_count, u.followers_count, u.following_count
      FROM conversations c
      JOIN users u ON c.contact_id = u.id
      ORDER BY c.updated_at DESC
    `).all() as any[];

    res.json(rows.map((r) => ({
      id: r.id,
      contact: {
        id: r.contact_id,
        name: r.name,
        handle: r.handle,
        avatar: r.avatar,
        bio: r.bio || '',
        activeStatus: r.active_status || '',
        postsCount: r.posts_count || 0,
        followersCount: r.followers_count || '0',
        followingCount: r.following_count || 0,
      },
      lastText: r.last_text || '',
      updatedAt: r.updated_at || '',
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
