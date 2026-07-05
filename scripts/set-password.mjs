// Reset any user's password (also signs them out everywhere).
// Usage: npm run set-password -- <username> <newPassword>
import bcrypt from "bcryptjs";
import { openDb } from "./db.mjs";

const [username, password] = process.argv.slice(2);
if (!username || !password) {
  console.error("Usage: npm run set-password -- <username> <newPassword>");
  process.exit(1);
}
if (password.length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

const db = await openDb();
const rows = await db.query("SELECT id FROM users WHERE username = $1", [username]);
if (rows.length === 0) {
  console.error(`No user named "${username}".`);
  await db.close();
  process.exit(1);
}
await db.query("UPDATE users SET password_hash = $1 WHERE username = $2", [
  await bcrypt.hash(password, 10),
  username,
]);
await db.query("DELETE FROM sessions WHERE user_id = $1", [rows[0].id]);
console.log(`Password updated for "${username}" (all their sessions cleared).`);
await db.close();
