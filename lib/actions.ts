"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  countUsers,
  createUser,
  getOwnedEntry,
  getUserByUsername,
  insertEntry,
  removeEntry,
  updateEntry,
  PUBLIC_CACHE_TAG,
  type EntryStatus,
  type MediaType,
} from "./db";
import { createSession, destroySession, requireOwner } from "./auth";
import { findPoster } from "./tmdb";
import { allow, clientIp } from "./ratelimit";
import { signupsOpen } from "./config";

function fail(page: string, message: string): never {
  redirect(`${page}?error=${encodeURIComponent(message)}`);
}

export async function signUp(formData: FormData): Promise<void> {
  if (!signupsOpen()) fail("/signup", "Sign-ups are currently closed.");

  const ip = await clientIp();
  if (!allow(`signup:${ip}`, 3, 60 * 60_000))
    fail("/signup", "Too many accounts created from this address. Try again later.");

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!/^[a-z0-9_]{3,20}$/.test(username))
    fail("/signup", "Username must be 3-20 characters (letters, numbers, underscores).");
  if (password.length < 10)
    fail("/signup", "Password must be at least 10 characters.");

  if (await getUserByUsername(username)) fail("/signup", "That username is taken.");

  const user = {
    id: crypto.randomUUID(),
    username,
    displayName: displayName || username,
    passwordHash: await bcrypt.hash(password, 10),
    // Everyone who signs up is a viewer. The very first account can claim
    // ownership only when ALLOW_OWNER_CLAIM=true is set — enable it for
    // initial setup, then remove it. This prevents a fresh public deploy
    // from being claimed by whoever signs up fastest.
    isOwner:
      process.env.ALLOW_OWNER_CLAIM === "true" && (await countUsers()) === 0,
    createdAt: new Date().toISOString(),
  };
  await createUser(user);
  if (user.isOwner) revalidateTag(PUBLIC_CACHE_TAG);

  await createSession(user.id);
  redirect("/");
}

export async function signIn(formData: FormData): Promise<void> {
  const ip = await clientIp();
  if (!allow(`signin:${ip}`, 5, 60_000))
    fail("/signin", "Too many attempts. Wait a minute and try again.");

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await getUserByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    fail("/signin", "Incorrect username or password.");

  await createSession(user.id);
  redirect("/");
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/signin");
}

export async function saveEntry(formData: FormData): Promise<void> {
  const user = await requireOwner();

  const id = String(formData.get("id") ?? "");
  const type = (formData.get("type") === "tv" ? "tv" : "movie") as MediaType;
  const title = String(formData.get("title") ?? "").trim();
  const ratingRaw = String(formData.get("rating") ?? "");
  const rating = ratingRaw ? Number(ratingRaw) : null;
  const toWatchlist = formData.get("watchlist") === "on";

  if (!title) fail(id ? `/log?id=${id}` : "/log", "A title is required.");

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const year = String(formData.get("year") ?? "").trim();
  let posterUrl = String(formData.get("posterUrl") ?? "").trim();
  let lookedUpId: number | null = null;

  // No poster given? Try to fetch the official one automatically.
  if (!posterUrl) {
    const found = await findPoster(title, year, type);
    if (found) {
      posterUrl = found.posterUrl;
      lookedUpId = found.tmdbId;
    }
  }

  const now = new Date().toISOString();

  const base = {
    type,
    title,
    year,
    season: type === "tv" ? String(formData.get("season") ?? "").trim() : "",
    rating: rating && rating >= 0.5 && rating <= 5 ? rating : null,
    review: String(formData.get("review") ?? "").trim(),
    watchedDate:
      String(formData.get("watchedDate") ?? "") || now.slice(0, 10),
    liked: formData.get("liked") === "on",
    rewatch: formData.get("rewatch") === "on",
    posterUrl,
    tags,
    status: (toWatchlist ? "watchlist" : "logged") as EntryStatus,
    updatedAt: now,
  };

  let entryId = id;
  if (id) {
    const existing = await getOwnedEntry(id, user.id);
    if (!existing) fail("/", "Entry not found.");
    await updateEntry(id, user.id, base);
  } else {
    entryId = crypto.randomUUID();
    const tmdbRaw = String(formData.get("tmdbId") ?? "");
    await insertEntry({
      id: entryId,
      userId: user.id,
      tmdbId: tmdbRaw ? Number(tmdbRaw) : lookedUpId,
      createdAt: now,
      ...base,
    });
  }

  revalidateTag(PUBLIC_CACHE_TAG);
  revalidatePath("/");
  redirect(toWatchlist ? "/watchlist" : `/entry/${entryId}`);
}

export async function deleteEntry(id: string): Promise<void> {
  const user = await requireOwner();
  await removeEntry(id, user.id);
  revalidateTag(PUBLIC_CACHE_TAG);
  revalidatePath("/");
  redirect("/");
}
