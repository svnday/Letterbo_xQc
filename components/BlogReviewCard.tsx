import Link from "next/link";
import Image from "next/image";
import { getTmdbImageUrl } from "@/lib/tmdb";

interface BlogReviewCardProps {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  user: { name: string | null; username: string | null; email: string };
  media: { title: string; type: string; tmdbId: number; posterPath: string | null };
}

export function BlogReviewCard({ rating, content, createdAt, user, media }: BlogReviewCardProps) {
  const displayName = user.name ?? user.username ?? user.email;
  const profileSlug = user.username ?? user.email;

  return (
    <article className="flex gap-6 p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
      <Link
        href={media.type === "movie" ? `/movie/${media.tmdbId}` : `/tv/${media.tmdbId}`}
        className="flex-shrink-0"
      >
        <div className="relative w-20 h-28 rounded overflow-hidden bg-zinc-800">
          <Image
            src={media.posterPath ? getTmdbImageUrl(media.posterPath, "w185") : "/placeholder-poster.svg"}
            alt={media.title}
            fill
            className="object-cover"
          />
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link
            href={media.type === "movie" ? `/movie/${media.tmdbId}` : `/tv/${media.tmdbId}`}
            className="font-semibold text-lg hover:text-amber-500 transition"
          >
            {media.title}
          </Link>
          <span className="text-amber-400 font-medium">{rating}/10</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
          <Link
            href={`/u/${encodeURIComponent(profileSlug)}`}
            className="text-amber-500 hover:underline"
          >
            {displayName}
          </Link>
          <span>·</span>
          <time>{new Date(createdAt).toLocaleDateString()}</time>
        </div>
        {content && (
          <p className="mt-3 text-zinc-300 whitespace-pre-wrap line-clamp-4">{content}</p>
        )}
      </div>
    </article>
  );
}
