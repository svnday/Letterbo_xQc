// Single source of truth for the database schema bootstrap.
// Imported by both the app (lib/db.ts) and the admin scripts (scripts/*.mjs).
export const DDL = `
  CREATE TABLE IF NOT EXISTS users (
    id text PRIMARY KEY,
    username text NOT NULL UNIQUE,
    display_name text NOT NULL,
    password_hash text NOT NULL,
    is_owner boolean NOT NULL DEFAULT false,
    created_at text NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token text PRIMARY KEY,
    user_id text NOT NULL,
    expires_at text NOT NULL
  );
  CREATE TABLE IF NOT EXISTS entries (
    id text PRIMARY KEY,
    user_id text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    year text NOT NULL DEFAULT '',
    season text NOT NULL DEFAULT '',
    rating real,
    review text NOT NULL DEFAULT '',
    watched_date text NOT NULL,
    liked boolean NOT NULL DEFAULT false,
    rewatch boolean NOT NULL DEFAULT false,
    poster_url text NOT NULL DEFAULT '',
    tags jsonb NOT NULL DEFAULT '[]',
    status text NOT NULL DEFAULT 'logged',
    tmdb_id integer,
    created_at text NOT NULL,
    updated_at text NOT NULL
  );
  CREATE INDEX IF NOT EXISTS entries_user_idx ON entries (user_id);
`;
