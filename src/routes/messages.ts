import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';

const router = Router();

// GET /api/messages - List messages of a conversation
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const conversationId = (req.query.conversation as string) || 'c_elena';
    const messages = db.prepare(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
    ).all(conversationId);
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

// Update conversation preview after a new message
function bumpConversation(db: ReturnType<typeof getDb>, conversationId: string, lastText: string) {
  db.prepare("UPDATE conversations SET last_text = ?, updated_at = datetime('now') WHERE id = ?")
    .run(lastText.slice(0, 80), conversationId);
}

// POST /api/messages - Send a message (optionally with an image data URL)
router.post('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { text, image, conversationId = 'c_elena' } = req.body;

    if ((!text || !text.trim()) && !image) {
      return res.status(400).json({ error: 'Message text or image is required' });
    }

    const id = `msg_${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    db.prepare('INSERT INTO messages (id, sender, text, timestamp, image, conversation_id) VALUES (?, ?, ?, ?, ?, ?)').run(
      id, 'user', (text || '').trim(), timestamp, image || '', conversationId
    );
    bumpConversation(db, conversationId, (text || '').trim() || '[图片]');

    res.json({ id, sender: 'user', text: (text || '').trim(), timestamp, image: image || undefined });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/messages/reply - Save an AI reply
router.post('/reply', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { text, conversationId = 'c_elena' } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Reply text is required' });
    }

    const id = `msg_ai_${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    db.prepare('INSERT INTO messages (id, sender, text, timestamp, conversation_id) VALUES (?, ?, ?, ?, ?)').run(
      id, 'other', text.trim(), timestamp, conversationId
    );
    bumpConversation(db, conversationId, text.trim());

    res.json({ id, sender: 'other', text: text.trim(), timestamp });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
