// Change an account's username (sign-in name and public @byline).
// Sessions stay valid — they reference the user id, not the username.
// Usage: npm run rename-user -- <currentUsername> <newUsername>
import { openDb } from "./db.mjs";

const [current, next] = process.argv.slice(2);
if (!current || !next) {
  console.error("Usage: npm run rename-user -- <currentUsername> <newUsername>");
  process.exit(1);
}
if (!/^[a-z0-9_]{3,20}$/.test(next)) {
  console.error("New username must be 3-20 characters (letters, numbers, underscores).");
  process.exit(1);
}

const db = await openDb();
const existing = await db.query("SELECT id FROM users WHERE username = $1", [current]);
if (existing.length === 0) {
  console.error(`No user named "${current}".`);
  await db.close();
  process.exit(1);
}
const taken = await db.query("SELECT id FROM users WHERE username = $1", [next]);
if (taken.length > 0) {
  console.error(`Username "${next}" is already taken.`);
  await db.close();
  process.exit(1);
}
await db.query("UPDATE users SET username = $1 WHERE id = $2", [next, existing[0].id]);
console.log(`Renamed "${current}" -> "${next}". They now sign in as "${next}".`);
await db.close();
