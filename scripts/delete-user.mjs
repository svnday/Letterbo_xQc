// Delete a viewer account (refuses to delete the owner).
// Usage: npm run delete-user -- <username>
import { openDb } from "./db.mjs";

const [username] = process.argv.slice(2);
if (!username) {
  console.error("Usage: npm run delete-user -- <username>");
  process.exit(1);
}

const db = await openDb();
const rows = await db.query(
  "SELECT id, is_owner FROM users WHERE username = $1",
  [username]
);
if (rows.length === 0) {
  console.error(`No user named "${username}".`);
  await db.close();
  process.exit(1);
}
if (rows[0].is_owner) {
  console.error("Refusing to delete the site owner. Promote a new owner first (npm run create-owner).");
  await db.close();
  process.exit(1);
}
await db.query("DELETE FROM sessions WHERE user_id = $1", [rows[0].id]);
await db.query("DELETE FROM users WHERE id = $1", [rows[0].id]);
console.log(`Deleted viewer account "${username}".`);
await db.close();
