import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const DB_PATH = path.join(process.cwd(), 'data', 'muse.db');

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

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

    // Run schema - try both __dirname and src/db path for production builds
    const schemaCandidates = [
      path.join(_dirname, 'schema.sql'),
      path.join(process.cwd(), 'src', 'db', 'schema.sql'),
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
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
