import fs from "fs";
import path from "path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { and, asc, eq, lte } from "drizzle-orm";
// plain-JS module so the admin scripts (scripts/*.mjs) can share it
import { DDL } from "./ddl.mjs";
import {
  users,
  sessions,
  entries,
  type User,
  type Session,
  type Entry,
  type MediaType,
  type EntryStatus,
} from "./schema";

export type { User, Session, Entry, MediaType, EntryStatus };

/**
 * Storage: Drizzle ORM speaking Postgres.
 *
 *  - With DATABASE_URL set (production): a hosted Postgres — Neon, Supabase,
 *    Railway, RDS, anything with a connection string.
 *  - Without it (local/dev): PGlite, a real Postgres engine embedded
 *    in-process, persisting to data/pg/. No accounts or services needed.
 *
 * Schema and queries are identical in both modes.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const PG_DIR = path.join(DATA_DIR, "pg");
const LEGACY_JSON = path.join(DATA_DIR, "db.json");

const DATABASE_URL = process.env.DATABASE_URL;

type DrizzleDb = ReturnType<typeof drizzlePglite>;

interface Conn {
  db: DrizzleDb;
  exec(sql: string): Promise<void>;
  rows<T>(sql: string): Promise<T[]>;
}

// Lazy, hot-reload-safe singleton. The connection is only opened on first
// query — never at import time. This matters: `next build` imports this
// module from several worker processes at once, and PGlite must not have
// the same data directory opened by multiple processes.
const g = globalThis as unknown as {
  __conn?: Conn;
  __dbInit?: Promise<void>;
};

function connect(): Conn {
  if (g.__conn) return g.__conn;
  if (DATABASE_URL) {
    const pool = new Pool({ connectionString: DATABASE_URL });
    g.__conn = {
      // Both drivers expose the same query-builder API for everything we
      // use; typing via the PGlite variant keeps callers driver-agnostic.
      db: drizzleNodePg(pool) as unknown as DrizzleDb,
      exec: async (sql) => {
        await pool.query(sql);
      },
      rows: async <T,>(sql: string) => (await pool.query(sql)).rows as T[],
    };
  } else {
    const client = new PGlite(PG_DIR);
    g.__conn = {
      db: drizzlePglite(client),
      exec: async (sql) => {
        await client.exec(sql);
      },
      rows: async <T,>(sql: string) => (await client.query<T>(sql)).rows,
    };
  }
  return g.__conn;
}

function db(): DrizzleDb {
  return connect().db;
}

async function rawExec(sql: string): Promise<void> {
  return connect().exec(sql);
}

async function rawRows<T>(sql: string): Promise<T[]> {
  return connect().rows<T>(sql);
}

async function init(): Promise<void> {
  await rawExec(DDL);

  // One-time import of the old JSON store, if present and we're empty.
  const [{ n }] = await rawRows<{ n: number }>(
    "SELECT count(*)::int AS n FROM users"
  );
  if (n === 0 && fs.existsSync(LEGACY_JSON)) {
    try {
      const legacy = JSON.parse(fs.readFileSync(LEGACY_JSON, "utf8")) as {
        users?: User[];
        sessions?: Session[];
        entries?: Entry[];
      };
      if (legacy.users?.length) await db().insert(users).values(legacy.users);
      if (legacy.sessions?.length)
        await db().insert(sessions).values(legacy.sessions);
      if (legacy.entries?.length)
        await db().insert(entries).values(legacy.entries);
      fs.renameSync(LEGACY_JSON, LEGACY_JSON + ".imported.bak");
      console.log(
        `[db] imported legacy db.json (${legacy.users?.length ?? 0} users, ${legacy.entries?.length ?? 0} entries)`
      );
    } catch (err) {
      console.error("[db] legacy import failed:", err);
    }
  }
}

function ready(): Promise<void> {
  return (g.__dbInit ??= init());
}

/* ---------- users ---------- */

export async function getUserById(id: string): Promise<User | null> {
  await ready();
  const rows = await db().select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getUserByUsername(
  username: string
): Promise<User | null> {
  await ready();
  const rows = await db()
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return rows[0] ?? null;
}

export async function countUsers(): Promise<number> {
  await ready();
  const [{ n }] = await rawRows<{ n: number }>(
    "SELECT count(*)::int AS n FROM users"
  );
  return n;
}

export async function createUser(user: User): Promise<void> {
  await ready();
  await db().insert(users).values(user);
}

/** The site owner — the one person whose reviews are published here. */
export async function getOwner(): Promise<User | null> {
  await ready();
  const flagged = await db()
    .select()
    .from(users)
    .where(eq(users.isOwner, true))
    .limit(1);
  if (flagged[0]) return flagged[0];
  const oldest = await db()
    .select()
    .from(users)
    .orderBy(asc(users.createdAt))
    .limit(1);
  return oldest[0] ?? null;
}

/* ---------- sessions ---------- */

export async function addSession(session: Session): Promise<void> {
  await ready();
  // prune expired sessions while we're here (ISO strings compare correctly)
  await db()
    .delete(sessions)
    .where(lte(sessions.expiresAt, new Date().toISOString()));
  await db().insert(sessions).values(session);
}

export async function findSession(token: string): Promise<Session | null> {
  await ready();
  const rows = await db()
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);
  return rows[0] ?? null;
}

export async function removeSession(token: string): Promise<void> {
  await ready();
  await db().delete(sessions).where(eq(sessions.token, token));
}

/* ---------- entries ---------- */

/** The owner's entries, i.e. the site's public content. */
export async function publicEntries(): Promise<Entry[]> {
  const owner = await getOwner();
  if (!owner) return [];
  await ready();
  return db().select().from(entries).where(eq(entries.userId, owner.id));
}

/** A single published (owner-authored) entry. */
export async function getPublicEntry(id: string): Promise<Entry | null> {
  const owner = await getOwner();
  if (!owner) return null;
  const rows = await db()
    .select()
    .from(entries)
    .where(and(eq(entries.id, id), eq(entries.userId, owner.id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getOwnedEntry(
  id: string,
  userId: string
): Promise<Entry | null> {
  await ready();
  const rows = await db()
    .select()
    .from(entries)
    .where(and(eq(entries.id, id), eq(entries.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertEntry(entry: Entry): Promise<void> {
  await ready();
  await db().insert(entries).values(entry);
}

export async function updateEntry(
  id: string,
  userId: string,
  patch: Partial<Entry>
): Promise<void> {
  await ready();
  await db()
    .update(entries)
    .set(patch)
    .where(and(eq(entries.id, id), eq(entries.userId, userId)));
}

export async function removeEntry(id: string, userId: string): Promise<void> {
  await ready();
  await db()
    .delete(entries)
    .where(and(eq(entries.id, id), eq(entries.userId, userId)));
}
