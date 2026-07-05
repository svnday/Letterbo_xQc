import { requireOwner } from "@/lib/auth";
import { getOwnedEntry, type Entry } from "@/lib/db";
import EntryForm from "@/components/EntryForm";

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<{
    id?: string;
    error?: string;
    title?: string;
    year?: string;
    type?: string;
    poster?: string;
    tmdbId?: string;
  }>;
}) {
  const user = await requireOwner();
  const params = await searchParams;

  let entry: Entry | undefined;
  if (params.id) {
    entry = (await getOwnedEntry(params.id, user.id)) ?? undefined;
  }

  const prefill: Partial<Entry> | undefined = params.title
    ? {
        title: params.title,
        year: params.year ?? "",
        type: params.type === "tv" ? "tv" : "movie",
        posterUrl: params.poster ?? "",
        tmdbId: params.tmdbId ? Number(params.tmdbId) : null,
      }
    : undefined;

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="mb-6 text-2xl font-bold text-white">
        {entry ? (
          <>Edit <span className="text-lbgreen">{entry.title}</span></>
        ) : (
          "Log a film or show"
        )}
      </h1>
      <EntryForm entry={entry} error={params.error} prefill={prefill} />
    </div>
  );
}
