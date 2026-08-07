import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';

const router = Router();

// GET /api/messages - List all messages
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const messages = db.prepare('SELECT * FROM messages ORDER BY created_at ASC').all();
    res.json(messages.map((m: any) => ({
      id: m.id,
      sender: m.sender,
      text: m.text,
      timestamp: m.timestamp,
      image: m.image || undefined,
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/messages - Send a message
router.post('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const id = `msg_${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    db.prepare('INSERT INTO messages (id, sender, text, timestamp) VALUES (?, ?, ?, ?)').run(
      id, 'user', text.trim(), timestamp
    );

    res.json({ id, sender: 'user', text: text.trim(), timestamp });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/messages/reply - Save an AI reply
router.post('/reply', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Reply text is required' });
    }

    const id = `msg_ai_${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    db.prepare('INSERT INTO messages (id, sender, text, timestamp) VALUES (?, ?, ?, ?)').run(
      id, 'other', text.trim(), timestamp
    );

    res.json({ id, sender: 'other', text: text.trim(), timestamp });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
