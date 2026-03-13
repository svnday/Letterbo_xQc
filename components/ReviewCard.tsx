import Link from "next/link";
import { RatingStars } from "./RatingStars";

interface ReviewCardProps {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  user: { name: string | null; username: string | null; email: string };
  media?: { title: string; type: string; tmdbId: number } | null;
}

export function ReviewCard({ rating, content, createdAt, user, media }: ReviewCardProps) {
  const displayName = user.name ?? user.username ?? user.email;
  const profileSlug = user.username ?? user.email;

  return (
    <article className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RatingStars value={rating} readOnly />
          <Link
            href={`/u/${encodeURIComponent(profileSlug)}`}
            className="text-amber-500 hover:underline font-medium"
          >
            {displayName}
          </Link>
        </div>
        <time className="text-zinc-500 text-sm">
          {new Date(createdAt).toLocaleDateString()}
        </time>
      </div>
      {media && (
        <Link
          href={media.type === "movie" ? `/movie/${media.tmdbId}` : `/tv/${media.tmdbId}`}
          className="text-zinc-400 text-sm hover:text-amber-500 mt-1 block"
        >
          {media.title}
        </Link>
      )}
      {content && (
        <p className="mt-2 text-zinc-300 text-sm whitespace-pre-wrap">{content}</p>
      )}
    </article>
  );
}
