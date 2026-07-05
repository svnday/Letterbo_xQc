import type { Entry } from "@/lib/db";
import PosterCard from "./PosterCard";

export default function MediaGrid({
  title,
  entries,
  emptyText,
}: {
  title: string;
  entries: Entry[];
  emptyText: string;
}) {
  return (
    <div className="py-10">
      <div className="mb-4 flex items-baseline justify-between border-b border-line pb-2">
        <h1 className="text-xs font-bold uppercase tracking-widest text-dim">
          {title}
        </h1>
        <span className="text-xs text-dim">{entries.length} titles</span>
      </div>
      {entries.length === 0 ? (
        <p className="py-16 text-center text-dim">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {entries.map((e) => (
            <PosterCard key={e.id} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}
