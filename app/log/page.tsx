import { requireOwner } from "@/lib/auth";
import { getOwnedEntry, type Entry } from "@/lib/db";
import EntryForm from "@/components/EntryForm";
import TitlePicker from "@/components/TitlePicker";

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
    manual?: string;
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

  // Search-first: the form only appears once a title is picked (or when
  // editing, or when manual entry is explicitly requested).
  const showForm = Boolean(entry || prefill || params.manual || params.error);

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="mb-6 text-2xl font-bold text-white">
        {entry ? (
          <>Edit <span className="text-lbgreen">{entry.title}</span></>
        ) : prefill ? (
          <>Log <span className="text-lbgreen">{prefill.title}</span></>
        ) : showForm ? (
          "Log a film or show"
        ) : (
          "What did you watch?"
        )}
      </h1>
      {showForm ? (
        <EntryForm entry={entry} error={params.error} prefill={prefill} />
      ) : (
        <TitlePicker />
      )}
    </div>
  );
}
