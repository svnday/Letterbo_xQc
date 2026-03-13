import { NextRequest, NextResponse } from "next/server";
import { appendFile } from "fs/promises";
import { join } from "path";
import { searchTmdb } from "@/lib/tmdb";
import { prisma } from "@/lib/prisma";

const LOG_PATH = join(process.cwd(), ".cursor/debug-bc788d.log");
async function dbg(p: Record<string, unknown>) {
  try {
    await appendFile(LOG_PATH, JSON.stringify({ sessionId: "bc788d", ...p, timestamp: Date.now() }) + "\n");
  } catch {}
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const type = searchParams.get("type"); // movie | tv | null (all)
  const id = searchParams.get("id"); // tmdb id for detail fetch

  if (id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const mediaType = searchParams.get("mediaType") ?? "movie";
    try {
      if (mediaType === "tv") {
        const { getTvById } = await import("@/lib/tmdb");
        const tv = await getTvById(numId);
        return NextResponse.json({
          id: tv.id,
          type: "tv",
          title: tv.name,
          overview: tv.overview,
          posterPath: tv.poster_path,
          releaseDate: tv.first_air_date,
        });
      }
      const { getMovieById } = await import("@/lib/tmdb");
      const movie = await getMovieById(numId);
      return NextResponse.json({
        id: movie.id,
        type: "movie",
        title: movie.title,
        overview: movie.overview,
        posterPath: movie.poster_path,
        releaseDate: movie.release_date,
      });
    } catch (e) {
      return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
    }
  }

  if (q && q.trim()) {
    // #region agent log
    await dbg({ location: "api/media/route.ts:search", message: "Search API called", data: { q: q.trim(), hasKey: !!process.env.TMDB_API_KEY }, hypothesisId: "H1" });
    // #endregion
    try {
      const result = await searchTmdb(q.trim());
      let results = result.results;
      if (type === "movie") results = results.filter((r) => r.media_type === "movie");
      if (type === "tv") results = results.filter((r) => r.media_type === "tv");
      // #region agent log
      await dbg({ location: "api/media/route.ts:success", message: "Search succeeded", data: { resultCount: results?.length }, hypothesisId: "H2" });
      // #endregion
      return NextResponse.json({ results });
    } catch (e) {
      // #region agent log
      await dbg({ location: "api/media/route.ts:catch", message: "Search failed", data: { error: String(e) }, hypothesisId: "H1" });
      // #endregion
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Missing q or id" }, { status: 400 });
}
