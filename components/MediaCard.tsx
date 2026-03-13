import Image from "next/image";
import Link from "next/link";
import { getTmdbImageUrl } from "@/lib/tmdb";

interface MediaCardProps {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseDate?: string;
}

export function MediaCard({ id, type, title, posterPath, releaseDate }: MediaCardProps) {
  const href = type === "movie" ? `/movie/${id}` : `/tv/${id}`;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800">
        <Image
          src={posterPath ? getTmdbImageUrl(posterPath, "w342") : "/placeholder-poster.svg"}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-poster.svg";
          }}
        />
      </div>
      <h3 className="mt-2 font-medium text-sm line-clamp-2 group-hover:text-amber-400 transition">
        {title}
      </h3>
      {year && <p className="text-zinc-500 text-xs">{year}</p>}
    </Link>
  );
}
