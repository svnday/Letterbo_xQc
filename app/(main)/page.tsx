import Link from "next/link";
import { MediaCard } from "@/components/MediaCard";
import { prisma } from "@/lib/prisma";
import { getTrendingMovies, getTrendingTv } from "@/lib/tmdb";

async function getTrending() {
  try {
    const [moviesRes, tvRes] = await Promise.all([
      getTrendingMovies(),
      getTrendingTv(),
    ]);
    return { movies: moviesRes.results, tv: tvRes.results };
  } catch {
    return { movies: [], tv: [] };
  }
}

async function getXqcReviews() {
  const featuredUsername = process.env.FEATURED_USERNAME ?? "xQc";
  const user = await prisma.user.findFirst({
    where: { username: featuredUsername },
    select: { id: true },
  });
  if (!user) return [];
  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    include: { media: true },
    orderBy: { createdAt: "desc" },
  });
  return reviews.map((r) => r.media);
}

export default async function HomePage() {
  const [{ movies, tv }, mediaItems] = await Promise.all([
    getTrending(),
    getXqcReviews(),
  ]);
  const featuredUsername = process.env.FEATURED_USERNAME ?? "xQc";

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Letterbo xQc</h1>
      <p className="text-zinc-400 mb-4">
        Rate and review movies and TV shows
      </p>
      <p className="text-zinc-300 mb-12 text-lg">
        Welcome {featuredUsername}, to your personal movie and TV show rating site.
        It&apos;s like Letterboxd but more personalized for you.
      </p>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Trending movies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.slice(0, 10).map((m) => (
            <MediaCard
              key={`m-${m.id}`}
              id={m.id}
              type="movie"
              title={m.title}
              posterPath={m.poster_path}
              releaseDate={m.release_date}
            />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Trending TV shows</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {tv.slice(0, 10).map((t) => (
            <MediaCard
              key={`t-${t.id}`}
              id={t.id}
              type="tv"
              title={t.name}
              posterPath={t.poster_path}
              releaseDate={t.first_air_date}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          xQc&apos;s recently reviewed Movies and/or Shows
        </h2>
        {mediaItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {mediaItems.map((m) => (
              <MediaCard
                key={m.id}
                id={m.tmdbId}
                type={m.type as "movie" | "tv"}
                title={m.title}
                posterPath={m.posterPath}
                releaseDate={m.releaseDate ?? undefined}
              />
            ))}
          </div>
        ) : (
          <p className="text-zinc-500">No reviews yet.</p>
        )}
      </section>

      <div className="mt-12 text-center">
        <Link
          href="/search"
          className="inline-block px-6 py-2 bg-amber-500 text-zinc-950 font-medium rounded hover:bg-amber-400 transition"
        >
          Search movies & TV
        </Link>
      </div>
    </div>
  );
}
