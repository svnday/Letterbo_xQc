"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LibResult {
  id: string;
  title: string;
  year: string;
  type: "movie" | "tv";
  season: string;
  status: "logged" | "watchlist";
}

interface ExtResult {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  year: string;
  posterUrl: string;
  overview: string;
}

function prefillHref(r: ExtResult): string {
  return `/log?title=${encodeURIComponent(r.title)}&year=${r.year}&type=${r.type}&poster=${encodeURIComponent(r.posterUrl)}&tmdbId=${r.tmdbId}`;
}

/**
 * Search-first step for logging: pick the film/show from TMDB and the log
 * form opens with title, year, type, and poster already filled in.
 */
export default function TitlePicker() {
  const [q, setQ] = useState("");
  const [ext, setExt] = useState<ExtResult[]>([]);
  const [lib, setLib] = useState<LibResult[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setExt([]);
      setLib([]);
      setSearched(false);
      return;
    }
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: ac.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          library: LibResult[];
          external: ExtResult[];
          externalConfigured: boolean;
        };
        setExt(data.external ?? []);
        setLib(data.library ?? []);
        setConfigured(data.externalConfigured);
        setSearched(true);
      } catch {
        // aborted — ignore
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && ext.length > 0) {
            e.preventDefault();
            router.push(prefillHref(ext[0]));
          }
        }}
        placeholder="Search for a film or TV show…"
        autoComplete="off"
        autoFocus
        className="!py-3 !text-lg"
        aria-label="Search for a title to log"
      />

      {!configured && searched && (
        <p className="mt-4 rounded border border-lborange/40 bg-lborange/10 px-3 py-2 text-sm text-lborange">
          External search isn&rsquo;t configured (TMDB_API_KEY missing), so
          titles can&rsquo;t be auto-filled — use the manual form below.
        </p>
      )}

      {lib.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-dim">
            Already in your reviews
          </h2>
          <ul className="divide-y divide-line rounded-lg bg-panel">
            {lib.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="truncate text-sm font-semibold text-white">
                    {r.title}
                  </span>
                  <span className="ml-2 text-xs text-dim">
                    {r.year}
                    {r.type === "tv" && r.season ? ` · ${r.season}` : ""}
                    {r.status === "watchlist" ? " · watchlist" : ""}
                  </span>
                </span>
                <Link
                  href={`/log?id=${r.id}`}
                  className="shrink-0 rounded bg-card px-3 py-1 text-xs font-bold text-white hover:bg-line"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {ext.length > 0 && (
        <ul className="mt-6 space-y-3">
          {ext.map((r) => (
            <li key={`${r.type}-${r.tmdbId}`}>
              <button
                type="button"
                onClick={() => router.push(prefillHref(r))}
                className="flex w-full gap-4 rounded-lg bg-panel p-3 text-left transition-colors hover:bg-card/60"
              >
                <span className="poster-frame w-14 shrink-0 self-start">
                  {r.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.posterUrl}
                      alt=""
                      className="aspect-[2/3] w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="block aspect-[2/3] bg-card" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-bold text-white">{r.title}</span>
                    {r.year && <span className="text-sm text-dim">{r.year}</span>}
                    <span
                      className={`rounded bg-card px-1.5 py-px text-[10px] font-bold uppercase ${
                        r.type === "tv" ? "text-lbblue" : "text-lborange"
                      }`}
                    >
                      {r.type === "tv" ? "TV" : "Film"}
                    </span>
                  </span>
                  {r.overview && (
                    <span className="mt-1 line-clamp-2 block text-sm text-dim">
                      {r.overview}
                    </span>
                  )}
                </span>
                <span className="shrink-0 self-center rounded bg-lbgreen px-3 py-1.5 text-sm font-bold text-[#14181c]">
                  Log this
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {searched && configured && ext.length === 0 && lib.length === 0 && !loading && (
        <p className="mt-6 text-center text-sm text-dim">
          Nothing found for &ldquo;{q.trim()}&rdquo;.
        </p>
      )}
      {loading && ext.length === 0 && (
        <p className="mt-6 text-center text-sm text-dim">Searching…</p>
      )}

      <p className="mt-8 text-center text-sm text-dim">
        Can&rsquo;t find it?{" "}
        <Link href="/log?manual=1" className="text-lbblue hover:underline">
          Enter the details manually
        </Link>
      </p>
    </div>
  );
}
