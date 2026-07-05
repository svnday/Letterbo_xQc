import Link from "next/link";
import { getOwner, publicEntries, type Entry } from "@/lib/db";
import Stars from "@/components/Stars";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

export default async function DiaryPage() {
  const owner = await getOwner();
  const logged = (await publicEntries())
    .filter((e) => e.status === "logged")
    .sort((a, b) => b.watchedDate.localeCompare(a.watchedDate));

  const byMonth = new Map<string, Entry[]>();
  for (const e of logged) {
    const key = e.watchedDate.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(e);
  }

  return (
    <div className="py-10">
      <h1 className="mb-6 border-b border-line pb-2 text-xs font-bold uppercase tracking-widest text-dim">
        {owner ? `${owner.displayName}'s diary` : "Diary"}
      </h1>

      {logged.length === 0 && (
        <p className="py-16 text-center text-dim">The diary is empty so far.</p>
      )}

      {[...byMonth.entries()].map(([month, items]) => (
        <section key={month} className="mb-8">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-lbgreen">
            {monthLabel(month)}
          </h2>
          <ul className="divide-y divide-line rounded-lg bg-panel">
            {items.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/entry/${e.id}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-card/40"
                >
                  <span className="w-8 shrink-0 text-center text-lg font-bold text-white">
                    {Number(e.watchedDate.slice(8, 10))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="truncate font-semibold text-white">
                      {e.title}
                    </span>
                    {e.year && <span className="ml-2 text-sm text-dim">{e.year}</span>}
                    {e.type === "tv" && (
                      <span className="ml-2 rounded bg-card px-1.5 py-px text-[10px] font-bold uppercase text-lbblue">
                        TV{e.season ? ` · ${e.season}` : ""}
                      </span>
                    )}
                  </span>
                  <Stars rating={e.rating} size={13} />
                  {e.liked && <span className="text-sm text-lborange">♥</span>}
                  {e.rewatch && <span className="text-sm text-lbblue">⟳</span>}
                  {e.review && <span className="text-xs text-dim">✎</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
