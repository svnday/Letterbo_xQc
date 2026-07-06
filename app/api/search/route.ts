import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { publicEntries } from "@/lib/db";
import { searchConfigured, searchExternal } from "@/lib/tmdb";

/**
 * Typeahead search. Library results (the published reviews) for everyone;
 * external TMDB results are included only for the signed-in owner, as an
 * authoring shortcut — they power one-click logging.
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ library: [], external: [] });

  const entries = await publicEntries();
  const library = entries
    .filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.year && e.year.startsWith(q)) ||
        e.tags.some((t) => t.includes(q))
    )
    .sort((a, b) => {
      // titles that start with the query first, then recent watches
      const aStarts = a.title.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.title.toLowerCase().startsWith(q) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return b.watchedDate.localeCompare(a.watchedDate);
    })
    .slice(0, 6)
    .map((e) => ({
      id: e.id,
      title: e.title,
      year: e.year,
      type: e.type,
      season: e.season,
      posterUrl: e.posterUrl,
      rating: e.rating,
      status: e.status,
    }));

  const user = await getCurrentUser();
  let external: Awaited<ReturnType<typeof searchExternal>> = [];
  if (user?.isOwner && searchConfigured()) {
    external = (await searchExternal(q)).slice(0, 6);
  }

  return NextResponse.json({ library, external });
}
