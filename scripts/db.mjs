// Shared DB access for the admin scripts. Uses DATABASE_URL when set
// (hosted Postgres), otherwise the local PGlite store in data/pg.
//
// NOTE: when using the local store, stop the dev server first — PGlite
// allows only one process at a time.

import { DDL } from "../lib/ddl.mjs";

export async function openDb() {
  const url = process.env.DATABASE_URL;
  let handle;
  if (url) {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url });
    handle = {
      exec: (sql) => pool.query(sql),
      query: (sql, params) => pool.query(sql, params).then((r) => r.rows),
      close: () => pool.end(),
    };
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const path = await import("path");
    // npm scripts always run from the project root
    const client = new PGlite(path.join(process.cwd(), "data", "pg"));
    handle = {
      exec: (sql) => client.exec(sql),
      query: (sql, params) => client.query(sql, params).then((r) => r.rows),
      close: () => client.close(),
    };
  }
  // idempotent — makes the scripts work against a brand-new database too
  await handle.exec(DDL);
  return handle;
}
