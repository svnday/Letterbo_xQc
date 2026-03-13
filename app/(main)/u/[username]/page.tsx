import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ReviewCard } from "@/components/ReviewCard";
import { MediaCard } from "@/components/MediaCard";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

async function getUserData(username: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: username }, { id: username }],
    },
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      createdAt: true,
    },
  });
  if (!user) return null;
  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    include: { media: true },
    orderBy: { createdAt: "desc" },
  });
  return { user, reviews };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [data, session] = await Promise.all([
    getUserData(username),
    getServerSession(authOptions),
  ]);
  if (!data) notFound();

  const { user, reviews } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold">
          {user.name ?? user.username ?? "User"}
        </h1>
        <p className="text-zinc-500 mt-1">@{user.username ?? user.id}</p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-zinc-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <ReviewCard
                key={r.id}
                id={r.id}
                rating={r.rating}
                content={r.content}
                createdAt={r.createdAt.toISOString()}
                user={{
                  name: user.name,
                  username: user.username,
                  email: "",
                }}
                media={r.media}
                canDelete={session?.user?.id === user.id}
              />
            ))}
          </div>
        )}
      </section>

      {reviews.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Rated</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {reviews.map((r) => (
              <MediaCard
                key={r.media.tmdbId}
                id={r.media.tmdbId}
                type={r.media.type as "movie" | "tv"}
                title={r.media.title}
                posterPath={r.media.posterPath ?? null}
                releaseDate={r.media.releaseDate ?? undefined}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
