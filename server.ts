import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { getDb, closeDb } from './src/db/database';
import { seedDatabase } from './src/db/seed';

import postsRouter from './src/routes/posts';
import messagesRouter from './src/routes/messages';
import conversationsRouter from './src/routes/conversations';
import usersRouter from './src/routes/users';
import bookmarksRouter from './src/routes/bookmarks';
import notificationsRouter from './src/routes/notifications';
import aiRouter from './src/routes/ai';
import { mobilePreviewHandler } from './src/routes/mobilePreview';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Security middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(express.json({ limit: '6mb' }));

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter for AI endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests, please try again later.' },
});

app.use('/api', apiLimiter);

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Muse' });
});

// Mobile device preview page (phone-framed iframe for mobile UI design)
app.get('/mobile-preview', mobilePreviewHandler);

// Mount route modules
app.use('/api/posts', postsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/user', usersRouter);
app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/ai', aiLimiter, aiRouter);

// Initialize database and seed data
getDb();
seedDatabase();

// Start Server & Mount Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Muse App server running on http://0.0.0.0:${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  closeDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDb();
  process.exit(0);
});

startServer();
