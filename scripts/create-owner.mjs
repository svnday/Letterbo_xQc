// Create (or promote) the site owner without opening sign-ups.
// Usage: npm run create-owner -- <username> <password> [displayName]
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { openDb } from "./db.mjs";

const [username, password, displayName] = process.argv.slice(2);
if (!username || !password) {
  console.error("Usage: npm run create-owner -- <username> <password> [displayName]");
  process.exit(1);
}
if (!/^[a-z0-9_]{3,20}$/.test(username)) {
  console.error("Username must be 3-20 characters (letters, numbers, underscores).");
  process.exit(1);
}
if (password.length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

const db = await openDb();
const hash = await bcrypt.hash(password, 10);
const existing = await db.query("SELECT id FROM users WHERE username = $1", [username]);

// single owner: demote everyone first
await db.query("UPDATE users SET is_owner = false", []);

if (existing.length > 0) {
  await db.query(
    "UPDATE users SET password_hash = $1, is_owner = true, display_name = COALESCE(NULLIF($2, ''), display_name) WHERE username = $3",
    [hash, displayName ?? "", username]
  );
  console.log(`Promoted existing user "${username}" to owner and updated their password.`);
} else {
  await db.query(
    "INSERT INTO users (id, username, display_name, password_hash, is_owner, created_at) VALUES ($1, $2, $3, $4, true, $5)",
    [crypto.randomUUID(), username, displayName || username, hash, new Date().toISOString()]
  );
  console.log(`Created owner account "${username}".`);
}
await db.close();
