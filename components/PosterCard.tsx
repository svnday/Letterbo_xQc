import Link from "next/link";
import type { Entry } from "@/lib/db";
import Stars from "./Stars";

// Deterministic gradient per title so placeholder posters feel intentional.
const PALETTES = [
  ["#1f3a5f", "#0f1c2e"],
  ["#3d2c54", "#171226"],
  ["#144d3c", "#0a2019"],
  ["#5f2e1f", "#26120a"],
  ["#2c4454", "#101c24"],
  ["#54402c", "#241a10"],
  ["#4a1f33", "#1e0c15"],
  ["#2e4a1f", "#13200c"],
];

function paletteFor(title: string): [string, string] {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return PALETTES[h % PALETTES.length] as [string, string];
}

export default function PosterCard({
  entry,
  showRating = true,
}: {
  entry: Entry;
  showRating?: boolean;
}) {
  const [c1, c2] = paletteFor(entry.title);
  return (
    <Link href={`/entry/${entry.id}`} className="group block">
      <div className="poster-frame aspect-[2/3] bg-card">
        {entry.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.posterUrl}
            alt={entry.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center"
            style={{ background: `linear-gradient(160deg, ${c1}, ${c2})` }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              {entry.type === "tv" ? "Series" : "Film"}
            </span>
            <span className="line-clamp-4 text-sm font-bold leading-snug text-white/90">
              {entry.title}
            </span>
            {entry.year && <span className="text-xs text-white/40">{entry.year}</span>}
          </div>
        )}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        {showRating && <Stars rating={entry.rating} size={12} />}
        {entry.liked && <span className="text-[11px] text-lborange">♥</span>}
        {entry.type === "tv" && (
          <span className="rounded bg-card px-1 py-px text-[9px] font-bold uppercase tracking-wider text-lbblue">
            TV
          </span>
        )}
      </div>
    </Link>
  );
}
