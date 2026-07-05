// Copy users and entries from the local PGlite store to the hosted database.
// Sessions are not copied (they're device-specific). Existing remote rows
// with the same id are left untouched.
//
// Usage:  DATABASE_URL must be set; stop the dev server first.
//   $env:DATABASE_URL="postgres://..."; npm run push-data     (PowerShell)
//   DATABASE_URL="postgres://..." npm run push-data           (bash)
import path from "path";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import { DDL } from "../lib/ddl.mjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set — nothing to copy to.");
  process.exit(1);
}

const local = new PGlite(path.join(process.cwd(), "data", "pg"));
const remote = new Pool({ connectionString: url });

await remote.query(DDL);

const { rows: localUsers } = await local.query("SELECT * FROM users");
const { rows: localEntries } = await local.query("SELECT * FROM entries");

let copiedUsers = 0;
for (const u of localUsers) {
  const r = await remote.query(
    `INSERT INTO users (id, username, display_name, password_hash, is_owner, created_at)
     VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
    [u.id, u.username, u.display_name, u.password_hash, u.is_owner, u.created_at]
  );
  copiedUsers += r.rowCount;
}

let copiedEntries = 0;
for (const e of localEntries) {
  const r = await remote.query(
    `INSERT INTO entries (id, user_id, type, title, year, season, rating, review,
       watched_date, liked, rewatch, poster_url, tags, status, tmdb_id, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     ON CONFLICT (id) DO NOTHING`,
    [e.id, e.user_id, e.type, e.title, e.year, e.season, e.rating, e.review,
     e.watched_date, e.liked, e.rewatch, e.poster_url, JSON.stringify(e.tags),
     e.status, e.tmdb_id, e.created_at, e.updated_at]
  );
  copiedEntries += r.rowCount;
}

const { rows: [remoteState] } = await remote.query(
  "SELECT (SELECT count(*)::int FROM users) AS users, (SELECT count(*)::int FROM entries) AS entries"
);
console.log(`copied ${copiedUsers} users, ${copiedEntries} entries`);
console.log(`remote now has ${remoteState.users} users, ${remoteState.entries} entries`);

await local.close();
await remote.end();
