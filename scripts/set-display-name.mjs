// Change an account's display name (shown in the masthead and profile).
// Usage: npm run set-display-name -- <username> <newDisplayName>
import { openDb } from "./db.mjs";

const [username, ...rest] = process.argv.slice(2);
const displayName = rest.join(" ").trim();
if (!username || !displayName) {
  console.error('Usage: npm run set-display-name -- <username> <newDisplayName>');
  process.exit(1);
}

const db = await openDb();
const rows = await db.query("SELECT id FROM users WHERE username = $1", [username]);
if (rows.length === 0) {
  console.error(`No user named "${username}".`);
  await db.close();
  process.exit(1);
}
await db.query("UPDATE users SET display_name = $1 WHERE id = $2", [displayName, rows[0].id]);
console.log(`Display name for "${username}" is now "${displayName}".`);
await db.close();
