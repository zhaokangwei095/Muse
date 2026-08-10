import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';

const router = Router();

// GET /api/notifications - List notifications (unread first, newest first)
router.get('/', (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const rows = db.prepare(
      'SELECT * FROM notifications ORDER BY is_read ASC, created_at DESC LIMIT 50'
    ).all() as any[];
    res.json(rows.map((n) => ({
      id: n.id,
      type: n.type,
      actorName: n.actor_name,
      text: n.text,
      postId: n.post_id || undefined,
      isRead: !!n.is_read,
      createdAt: n.created_at,
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notifications/read-all - Mark all as read
router.post('/read-all', (_req: Request, res: Response) => {
  try {
    const db = getDb();
    db.prepare('UPDATE notifications SET is_read = 1 WHERE is_read = 0').run();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
