// Make an existing account the site's featured reviewer (the "owner"):
// their reviews become the site's public content and they get the + LOG
// button. Any previous owner is demoted to a viewer. Passwords are not
// touched — use this to hand the site to someone who signed up themselves.
// Usage: npm run promote-user -- <username>
import { openDb } from "./db.mjs";

const [username] = process.argv.slice(2);
if (!username) {
  console.error("Usage: npm run promote-user -- <username>");
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
  console.log(`"${username}" is already the featured reviewer.`);
  await db.close();
  process.exit(0);
}

await db.query("UPDATE users SET is_owner = false", []);
await db.query("UPDATE users SET is_owner = true WHERE id = $1", [rows[0].id]);
console.log(
  `"${username}" is now the featured reviewer — the site publishes their reviews.`
);
console.log(
  "Note: the public pages can serve cached data for up to 5 minutes after this change."
);
await db.close();
