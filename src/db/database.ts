import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'muse.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Run schema - works in both dev (src/db) and production build (dist)
    const schemaCandidates = [
      path.join(process.cwd(), 'src', 'db', 'schema.sql'),
      path.join(process.cwd(), 'dist', 'schema.sql'),
    ];
    let schema = '';
    for (const p of schemaCandidates) {
      if (fs.existsSync(p)) {
        schema = fs.readFileSync(p, 'utf-8');
        break;
      }
    }
    if (!schema) {
      throw new Error('schema.sql not found. Ensure it is in src/db/ or copied to dist.');
    }
    db.exec(schema);

    // Migration: add conversation_id to messages for databases created earlier
    const msgCols = db.prepare('PRAGMA table_info(messages)').all() as any[];
    if (!msgCols.some((c) => c.name === 'conversation_id')) {
      db.exec("ALTER TABLE messages ADD COLUMN conversation_id TEXT DEFAULT 'c_elena'");
    }
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
