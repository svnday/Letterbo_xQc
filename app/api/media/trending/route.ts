import { NextResponse } from "next/server";
import { getTrendingMovies, getTrendingTv } from "@/lib/tmdb";

export async function GET() {
  try {
    const [movies, tv] = await Promise.all([
      getTrendingMovies(),
      getTrendingTv(),
    ]);
    return NextResponse.json({
      movies: movies.results,
      tv: tv.results,
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch trending" }, { status: 500 });
  }
}
