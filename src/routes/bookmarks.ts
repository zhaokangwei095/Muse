import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';
import { CURRENT_USER_ID } from '../constants';

const router = Router();

// GET /api/bookmarks - List all bookmarks
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const bookmarks = db.prepare(
      'SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC'
    ).all(CURRENT_USER_ID);

    res.json(bookmarks.map((bm: any) => ({
      id: bm.id,
      title: bm.title,
      category: bm.category,
      source: bm.source,
      imageUrl: bm.image_url,
      tags: JSON.parse(bm.tags || '[]'),
      excerpt: bm.excerpt || '',
      isSaved: true,
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/bookmarks/:id - Remove a bookmark
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM bookmarks WHERE id = ? AND user_id = ?').run(req.params.id, CURRENT_USER_ID);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
