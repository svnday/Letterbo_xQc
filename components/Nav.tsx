import Link from "next/link";
import { signOut } from "@/lib/actions";
import LiveSearch from "./LiveSearch";

function Dots() {
  return (
    <span className="mr-1.5 inline-flex items-center gap-[3px]">
      <span className="h-3 w-3 rounded-full bg-lborange" />
      <span className="h-3 w-3 rounded-full bg-lbgreen" />
      <span className="h-3 w-3 rounded-full bg-lbblue" />
    </span>
  );
}

export default function Nav({
  user,
}: {
  user: { username: string; displayName: string; isOwner: boolean } | null;
}) {
  return (
    <header className="border-b border-line bg-panel/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-6 px-4">
        <Link
          href="/"
          className="flex items-center text-xl font-extrabold tracking-tight text-white"
        >
          <Dots />
          Letterbo<span className="text-lbgreen">xQc</span>
        </Link>

        {/* Browsing is public — everyone gets the full nav. */}
        <nav className="hidden items-center gap-5 text-sm font-semibold uppercase tracking-wide text-mute sm:flex">
          <Link href="/films" className="hover:text-white">Films</Link>
          <Link href="/shows" className="hover:text-white">Shows</Link>
          <Link href="/diary" className="hover:text-white">Diary</Link>
          <Link href="/watchlist" className="hover:text-white">Watchlist</Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:block">
            <LiveSearch variant="nav" />
          </div>

          {user?.isOwner && (
            <Link
              href="/log"
              className="rounded bg-lbgreen px-3 py-1.5 text-sm font-bold text-[#14181c] hover:brightness-110"
            >
              + LOG
            </Link>
          )}

          {user ? (
            <>
              <Link
                href="/profile"
                title={user.displayName}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-lbblue text-sm font-bold text-[#14181c]"
              >
                {user.displayName.charAt(0).toUpperCase()}
              </Link>
              <form action={signOut}>
                <button className="text-xs text-dim hover:text-white" type="submit">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/signin"
              className="text-xs font-semibold uppercase tracking-wide text-dim hover:text-white"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
