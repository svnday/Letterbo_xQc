import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { publicEntries } from "@/lib/db";
import { searchConfigured, searchExternal } from "@/lib/tmdb";
import PosterCard from "@/components/PosterCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getCurrentUser();
  const isOwner = user?.isOwner ?? false;
  const { q = "" } = await searchParams;
  const query = q.trim();

  const mine = query
    ? (await publicEntries()).filter(
        (e) =>
          e.title.toLowerCase().includes(query.toLowerCase()) ||
          e.tags.some((t) => t.includes(query.toLowerCase()))
      )
    : [];

  const external =
    isOwner && query && searchConfigured() ? await searchExternal(query) : [];

  return (
    <div className="py-10">
      <form action="/search" className="mb-8">
        <input
          type="text"
          name="q"
          defaultValue={query}
          autoFocus
          placeholder="Search films and TV shows…"
          className="!py-3 !text-lg"
        />
      </form>

      {query && (
        <>
          <h2 className="mb-3 border-b border-line pb-2 text-xs font-bold uppercase tracking-widest text-dim">
            Reviews
          </h2>
          {mine.length === 0 ? (
            <p className="mb-8 text-sm text-dim">
              No reviews match &ldquo;{query}&rdquo;.
            </p>
          ) : (
            <div className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {mine.map((e) => (
                <PosterCard key={e.id} entry={e} />
              ))}
            </div>
          )}

          {/* External catalogue search is an authoring tool — owner only. */}
          {isOwner && (
            <>
              <h2 className="mb-3 border-b border-line pb-2 text-xs font-bold uppercase tracking-widest text-dim">
                Everywhere else
              </h2>
              {!searchConfigured() ? (
                <div className="rounded-lg border border-dashed border-line bg-panel/50 p-8 text-center">
                  <p className="text-mute">
                    External search isn&rsquo;t connected yet.
                  </p>
                  <p className="mt-2 text-sm text-dim">
                    Add your API key to{" "}
                    <code className="rounded bg-card px-1.5 py-0.5">.env.local</code>{" "}
                    as{" "}
                    <code className="rounded bg-card px-1.5 py-0.5">TMDB_API_KEY</code>{" "}
                    and results from the whole movie &amp; TV catalogue will
                    appear here, with one-click logging and automatic posters.
                  </p>
                </div>
              ) : external.length === 0 ? (
                <p className="text-sm text-dim">No external results.</p>
              ) : (
                <ul className="space-y-3">
                  {external.slice(0, 12).map((r) => (
                    <li
                      key={`${r.type}-${r.tmdbId}`}
                      className="flex gap-4 rounded-lg bg-panel p-3"
                    >
                      <div className="poster-frame w-14 shrink-0 self-start">
                        {r.posterUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.posterUrl}
                            alt={r.title}
                            className="aspect-[2/3] w-full object-cover"
                          />
                        ) : (
                          <div className="aspect-[2/3] bg-card" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-white">{r.title}</span>
                          {r.year && (
                            <span className="text-sm text-dim">{r.year}</span>
                          )}
                          <span className="rounded bg-card px-1.5 py-px text-[10px] font-bold uppercase text-lbblue">
                            {r.type === "tv" ? "TV" : "Film"}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-dim">
                          {r.overview}
                        </p>
                      </div>
                      <Link
                        href={`/log?title=${encodeURIComponent(r.title)}&year=${r.year}&type=${r.type}&poster=${encodeURIComponent(r.posterUrl)}&tmdbId=${r.tmdbId}`}
                        className="self-center rounded bg-lbgreen px-3 py-1.5 text-sm font-bold text-[#14181c] hover:brightness-110"
                      >
                        + Log
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
