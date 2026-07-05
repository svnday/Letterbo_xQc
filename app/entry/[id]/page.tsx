import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOwner, getPublicEntry } from "@/lib/db";
import { deleteEntry } from "@/lib/actions";
import Stars from "@/components/Stars";

export default async function EntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const owner = await getOwner();
  const user = await getCurrentUser();
  const { id } = await params;
  // Only the owner's entries are published on this site.
  const entry = await getPublicEntry(id);
  if (!entry) notFound();

  const watched = new Date(entry.watchedDate + "T00:00:00");
  const deleteThis = deleteEntry.bind(null, entry.id);

  return (
    <div className="py-10">
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <div>
          <div className="poster-frame aspect-[2/3] bg-card">
            {entry.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.posterUrl}
                alt={entry.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-4 text-center text-sm font-bold text-white/70">
                {entry.title}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-3xl font-extrabold text-white">{entry.title}</h1>
            {entry.year && <span className="text-xl text-dim">{entry.year}</span>}
            <span
              className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                entry.type === "tv"
                  ? "bg-lbblue/15 text-lbblue"
                  : "bg-lborange/15 text-lborange"
              }`}
            >
              {entry.type === "tv" ? "TV Series" : "Film"}
            </span>
            {entry.season && (
              <span className="text-sm text-mute">{entry.season}</span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Stars rating={entry.rating} size={22} />
            {entry.liked && (
              <span className="flex items-center gap-1 text-sm text-lborange">
                ♥ Liked
              </span>
            )}
            {entry.rewatch && (
              <span className="flex items-center gap-1 text-sm text-lbblue">
                ⟳ Rewatch
              </span>
            )}
          </div>

          <p className="mt-3 text-sm text-dim">
            {entry.status === "watchlist" ? (
              <span className="text-lbgreen">On your watchlist</span>
            ) : (
              <>
                Watched on{" "}
                {watched.toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </>
            )}
          </p>

          {entry.review ? (
            <div className="mt-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-dim">
                Review by{" "}
                <Link href="/profile" className="text-lbblue hover:underline">
                  @{owner?.username}
                </Link>
              </p>
              <div className="whitespace-pre-wrap border-l-2 border-lbgreen pl-4 leading-relaxed text-[#dee7ee]">
                {entry.review}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm italic text-dim">No review written.</p>
          )}

          {entry.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {entry.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-card px-3 py-1 text-xs text-mute"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {user?.isOwner && (
            <div className="mt-10 flex items-center gap-3 border-t border-line pt-5">
              <Link
                href={`/log?id=${entry.id}`}
                className="rounded bg-card px-4 py-2 text-sm font-bold text-white hover:bg-line"
              >
                Edit
              </Link>
              <form action={deleteThis}>
                <button
                  type="submit"
                  className="rounded px-4 py-2 text-sm font-bold text-lborange hover:bg-lborange/10"
                >
                  Delete
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
