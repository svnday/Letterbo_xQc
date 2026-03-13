import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BlogReviewCard } from "@/components/BlogReviewCard";
import { ComposeButton } from "@/components/ComposeButton";

async function getFeedReviews() {
  const featuredUsername = process.env.FEATURED_USERNAME ?? "xQc";
  const user = await prisma.user.findFirst({
    where: { username: featuredUsername },
    select: { id: true },
  });
  if (!user) return [];
  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    include: {
      user: { select: { id: true, name: true, username: true, email: true } },
      media: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return reviews;
}

export default async function HomePage() {
  const reviews = await getFeedReviews();
  const featuredUsername = process.env.FEATURED_USERNAME ?? "xQc";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Letterbo xQc</h1>
        <p className="text-zinc-400 mb-4">
          Rate and review movies and TV shows
        </p>
        <p className="text-zinc-300 mb-6 text-lg">
          Welcome {featuredUsername}, to your personal movie and TV show rating site.
          It&apos;s like Letterboxd but more personalized for you.
        </p>
        <ComposeButton />
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-6">Reviews</h2>
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((r) => (
              <BlogReviewCard
                key={r.id}
                id={r.id}
                rating={r.rating}
                content={r.content}
                createdAt={r.createdAt.toISOString()}
                user={r.user}
                media={{
                  title: r.media.title,
                  type: r.media.type,
                  tmdbId: r.media.tmdbId,
                  posterPath: r.media.posterPath,
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-zinc-500">No reviews yet. Click &quot;Review something&quot; to get started.</p>
        )}
      </section>

      <div className="mt-12 text-center flex flex-wrap justify-center gap-4">
        <Link
          href="/search/movies"
          className="inline-block px-6 py-2 bg-amber-500 text-zinc-950 font-medium rounded hover:bg-amber-400 transition"
        >
          Search movies
        </Link>
        <Link
          href="/search/tv"
          className="inline-block px-6 py-2 bg-amber-500 text-zinc-950 font-medium rounded hover:bg-amber-400 transition"
        >
          Search TV shows
        </Link>
      </div>
    </div>
  );
}
