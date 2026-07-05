import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import {
  addSession,
  findSession,
  getUserById,
  removeSession,
  type User,
} from "./db";

const COOKIE_NAME = "lbqc_session";
const SESSION_DAYS = 90;

export async function createSession(userId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);

  await addSession({ token, userId, expiresAt: expiresAt.toISOString() });

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) await removeSession(token);
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await findSession(token);
  if (!session || new Date(session.expiresAt) <= new Date()) return null;

  return getUserById(session.userId);
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return user;
}

/** Only the site owner may create or change reviews. */
export async function requireOwner(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  if (!user.isOwner) redirect("/");
  return user;
}
