import Database from "better-sqlite3";

const db = new Database(process.env.DB_PATH || "gateway.db");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT UNIQUE,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_keys (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER,
 key TEXT UNIQUE,
 enabled INTEGER DEFAULT 1,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usage_logs (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 api_key TEXT,
 model TEXT,
 tokens INTEGER DEFAULT 0,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

export default db;
