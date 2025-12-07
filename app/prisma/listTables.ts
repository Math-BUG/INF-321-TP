import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace('file:', '') : './dev.db';
const fullPath = path.resolve(dbPath);
const db = new Database(fullPath, { readonly: true });
const rows = db.prepare("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') ORDER BY name").all();
console.log('DB file:', fullPath);
console.table(rows);
