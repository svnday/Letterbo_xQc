import Image from "next/image";
import { notFound } from "next/navigation";
import { getTvById } from "@/lib/tmdb";
import { getTmdbImageUrl } from "@/lib/tmdb";
import { prisma } from "@/lib/prisma";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";

export default async function TvPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) notFound();

  let tv;
  try {
    tv = await getTvById(numId);
  } catch {
    notFound();
  }

  const media = await prisma.media.findUnique({
    where: { tmdbId: numId },
  });
  const reviews = media
    ? await prisma.review.findMany({
        where: { mediaId: media.id },
        include: {
          user: { select: { id: true, name: true, username: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0">
          <div className="relative w-full max-w-[300px] aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800">
            <Image
              src={
                tv.poster_path
                  ? getTmdbImageUrl(tv.poster_path, "w500")
                  : "/placeholder-poster.svg"
              }
              alt={tv.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{tv.name}</h1>
          <p className="text-zinc-400 mt-1">
            {tv.first_air_date
              ? new Date(tv.first_air_date).getFullYear()
              : ""}{" "}
            · TV Show
          </p>
          {avgRating !== null && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-amber-400 font-medium">{avgRating.toFixed(1)}/10</span>
              <span className="text-zinc-400">({reviews.length} reviews)</span>
            </div>
          )}
          <p className="mt-6 text-zinc-300 leading-relaxed">{tv.overview}</p>
          <ReviewForm tmdbId={numId} mediaType="tv" mediaTitle={tv.name} />
        </div>
      </div>
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Reviews</h2>
        <div className="space-y-4">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              id={r.id}
              rating={r.rating}
              content={r.content}
              createdAt={r.createdAt.toISOString()}
              user={r.user}
            />
          ))}
          {reviews.length === 0 && (
            <p className="text-zinc-500">No reviews yet. Be the first!</p>
          )}
        </div>
      </section>
    </div>
  );
}
