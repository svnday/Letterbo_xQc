import { notFound } from "next/navigation";
import { getOwner, publicEntries } from "@/lib/db";
import PosterCard from "@/components/PosterCard";

export default async function ProfilePage() {
  const user = await getOwner();
  if (!user) notFound();
  const all = await publicEntries();
  const logged = all.filter((e) => e.status === "logged");
  const films = logged.filter((e) => e.type === "movie");
  const shows = logged.filter((e) => e.type === "tv");
  const rated = logged.filter((e) => e.rating != null);
  const avg =
    rated.length > 0
      ? (rated.reduce((s, e) => s + (e.rating ?? 0), 0) / rated.length).toFixed(1)
      : "—";
  const year = new Date().getFullYear().toString();
  const thisYear = logged.filter((e) => e.watchedDate.startsWith(year)).length;
  const liked = logged.filter((e) => e.liked);

  // ratings histogram: 0.5 → 5.0
  const buckets = Array.from({ length: 10 }, (_, i) => (i + 1) / 2);
  const counts = buckets.map(
    (b) => rated.filter((e) => e.rating === b).length
  );
  const maxCount = Math.max(1, ...counts);

  const favourites = logged
    .filter((e) => (e.rating ?? 0) >= 4.5 || e.liked)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 6);

  const stats: [string, string | number][] = [
    ["Films", films.length],
    ["TV shows", shows.length],
    ["This year", thisYear],
    ["Liked", liked.length],
    ["Avg rating", avg],
  ];

  return (
    <div className="py-10">
      <div className="mb-10 flex items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-lbblue text-3xl font-extrabold text-[#14181c]">
          {user.displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
          <p className="text-sm text-dim">
            @{user.username} · member since{" "}
            {new Date(user.createdAt).toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-panel p-4 text-center">
            <div className="text-2xl font-extrabold text-white">{value}</div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-dim">
              {label}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-10">
        <h2 className="mb-3 border-b border-line pb-2 text-xs font-bold uppercase tracking-widest text-dim">
          Ratings
        </h2>
        {rated.length === 0 ? (
          <p className="text-sm text-dim">No ratings yet.</p>
        ) : (
          <div className="flex h-24 items-end gap-1">
            <span className="pb-0.5 pr-1 text-xs text-dim">½★</span>
            {counts.map((c, i) => (
              <div
                key={i}
                title={`${buckets[i]} stars — ${c}`}
                className="flex-1 rounded-t-sm bg-lbgreen/80 transition-colors hover:bg-lbgreen"
                style={{ height: `${Math.max(4, (c / maxCount) * 100)}%`, opacity: c === 0 ? 0.15 : 1 }}
              />
            ))}
            <span className="pb-0.5 pl-1 text-xs text-dim">5★</span>
          </div>
        )}
      </div>

      {favourites.length > 0 && (
        <div>
          <h2 className="mb-3 border-b border-line pb-2 text-xs font-bold uppercase tracking-widest text-dim">
            Favourites
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {favourites.map((e) => (
              <PosterCard key={e.id} entry={e} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
