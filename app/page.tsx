import Link from "next/link";
import { ownerClaimOpen } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { getOwner, publicEntries, type Entry } from "@/lib/db";
import PosterCard from "@/components/PosterCard";
import Stars from "@/components/Stars";

/** Shown only until the site's one reviewer creates their account. */
function SetupLanding() {
  const claimable = ownerClaimOpen();
  return (
    <div className="py-24 text-center">
      <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight text-white">
        This journal doesn&rsquo;t have an author yet.
      </h1>
      {claimable ? (
        <>
          <p className="mx-auto mt-4 max-w-xl text-lg text-mute">
            Owner setup is enabled — the first account created becomes the
            site&rsquo;s reviewer. Every film and TV review they write is
            published here for the world to read.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded bg-lbgreen px-8 py-3 text-lg font-bold text-[#14181c] hover:brightness-110"
          >
            Claim it
          </Link>
        </>
      ) : (
        <p className="mx-auto mt-4 max-w-xl text-lg text-mute">
          Reviews will appear here once the site is set up. (Admin: set{" "}
          <code className="rounded bg-card px-1.5 py-0.5 text-base">
            ALLOW_OWNER_CLAIM=true
          </code>{" "}
          and sign up to claim ownership, then remove the flag.)
        </p>
      )}
    </div>
  );
}

function ReviewCard({ entry, byline }: { entry: Entry; byline: string }) {
  const watched = new Date(entry.watchedDate + "T00:00:00");
  return (
    <article className="flex gap-5 rounded-lg bg-panel p-5">
      <Link href={`/entry/${entry.id}`} className="w-24 shrink-0 sm:w-28">
        <div className="poster-frame aspect-[2/3] bg-card">
          {entry.posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.posterUrl}
              alt={entry.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs font-bold text-white/70">
              {entry.title}
            </div>
          )}
        </div>
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <Link
            href={`/entry/${entry.id}`}
            className="text-lg font-bold text-white hover:text-lbgreen"
          >
            {entry.title}
          </Link>
          {entry.year && <span className="text-sm text-dim">{entry.year}</span>}
          {entry.type === "tv" && (
            <span className="rounded bg-card px-1.5 py-px text-[10px] font-bold uppercase text-lbblue">
              TV{entry.season ? ` · ${entry.season}` : ""}
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Stars rating={entry.rating} size={15} />
          {entry.liked && <span className="text-sm text-lborange">♥</span>}
          {entry.rewatch && <span className="text-sm text-lbblue">⟳</span>}
          <span className="text-xs text-dim">
            Reviewed by{" "}
            <Link href="/profile" className="font-semibold text-lbblue hover:underline">
              @{byline}
            </Link>{" "}
            ·{" "}
            {watched.toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        {entry.review && (
          <p className="mt-3 line-clamp-3 leading-relaxed text-[#c8d4de]">
            {entry.review}
          </p>
        )}
        <Link
          href={`/entry/${entry.id}`}
          className="mt-2 inline-block text-xs font-semibold uppercase tracking-wide text-lbgreen hover:underline"
        >
          Read more
        </Link>
      </div>
    </article>
  );
}

export default async function HomePage() {
  const owner = await getOwner();
  if (!owner) return <SetupLanding />;

  const user = await getCurrentUser();
  const logged = (await publicEntries())
    .filter((e) => e.status === "logged")
    .sort((a, b) => b.watchedDate.localeCompare(a.watchedDate));

  const reviews = logged.filter((e) => e.review).slice(0, 5);
  const recent = logged.slice(0, 12);
  const year = new Date().getFullYear().toString();
  const thisYear = logged.filter((e) => e.watchedDate.startsWith(year)).length;

  return (
    <div className="py-10">
      {/* Site masthead — who this is */}
      <div className="mb-10 flex flex-wrap items-center gap-5 border-b border-line pb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-lbblue text-2xl font-extrabold text-[#14181c]">
          {owner.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold text-white">
            {owner.displayName}&rsquo;s film &amp; TV journal
          </h1>
          <p className="mt-1 text-sm text-dim">
            {logged.length} titles reviewed · {thisYear} this year ·{" "}
            <Link href="/profile" className="text-lbblue hover:underline">
              about
            </Link>
          </p>
        </div>
        {user?.isOwner && (
          <Link
            href="/log"
            className="rounded bg-lbgreen px-4 py-2 text-sm font-bold text-[#14181c] hover:brightness-110"
          >
            + Log a film or show
          </Link>
        )}
      </div>

      {logged.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-panel/50 p-14 text-center">
          <p className="text-lg text-mute">No reviews published yet.</p>
          <p className="mt-1 text-sm text-dim">Check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          <section>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-dim">
              Latest reviews
            </h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-dim">
                Nothing written yet — ratings only so far.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((e) => (
                  <ReviewCard key={e.id} entry={e} byline={owner.username} />
                ))}
              </div>
            )}
          </section>

          <aside>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-dim">
              Recently watched
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {recent.map((e) => (
                <PosterCard key={e.id} entry={e} showRating={false} />
              ))}
            </div>
            <Link
              href="/diary"
              className="mt-4 inline-block text-xs font-semibold uppercase tracking-wide text-lbgreen hover:underline"
            >
              Full diary →
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
