import {
  pgTable,
  text,
  boolean,
  real,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export type MediaType = "movie" | "tv";
export type EntryStatus = "logged" | "watchlist";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  isOwner: boolean("is_owner").notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: text("expires_at").notNull(),
});

export const entries = pgTable("entries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").$type<MediaType>().notNull(),
  title: text("title").notNull(),
  year: text("year").notNull().default(""),
  season: text("season").notNull().default(""),
  rating: real("rating"),
  review: text("review").notNull().default(""),
  watchedDate: text("watched_date").notNull(),
  liked: boolean("liked").notNull().default(false),
  rewatch: boolean("rewatch").notNull().default(false),
  posterUrl: text("poster_url").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  status: text("status").$type<EntryStatus>().notNull().default("logged"),
  tmdbId: integer("tmdb_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Entry = typeof entries.$inferSelect;
