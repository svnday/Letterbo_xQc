"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ComposeModal } from "./ComposeModal";

export function Nav() {
  const { data: session, status } = useSession();
  const [composeOpen, setComposeOpen] = useState(false);

  return (
    <>
      <nav className="border-b border-zinc-800 bg-zinc-900/80 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/" className="font-bold text-xl text-amber-500">
            LetterboxQc
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/search" className="text-zinc-400 hover:text-white transition">
              Search
            </Link>
            {session && (
              <button
                onClick={() => setComposeOpen(true)}
                className="px-3 py-1.5 bg-amber-500 text-zinc-950 font-medium rounded hover:bg-amber-400 transition"
              >
                Review something
              </button>
            )}
            {status === "loading" ? (
            <span className="text-zinc-500">...</span>
          ) : session ? (
            <>
              {((session.user as { username?: string }).username ?? session.user?.id) && (
                <Link
                  href={`/u/${encodeURIComponent(
                    (session.user as { username?: string }).username ?? session.user!.id
                  )}`}
                  className="text-zinc-400 hover:text-white transition"
                >
                  {session.user?.name ?? (session.user as { username?: string }).username ?? "Profile"}
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="text-zinc-400 hover:text-white transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-zinc-400 hover:text-white transition">
                Log in
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 bg-amber-500 text-zinc-950 font-medium rounded hover:bg-amber-400 transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
    <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} />
    </>
  );
}
