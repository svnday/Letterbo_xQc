"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface LibResult {
  id: string;
  title: string;
  year: string;
  type: "movie" | "tv";
  season: string;
  posterUrl: string;
  rating: number | null;
  status: "logged" | "watchlist";
}

interface ExtResult {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  year: string;
  posterUrl: string;
}

type Item =
  | { kind: "lib"; r: LibResult }
  | { kind: "ext"; r: ExtResult };

function itemHref(item: Item): string {
  if (item.kind === "lib") return `/entry/${item.r.id}`;
  const r = item.r;
  return `/log?title=${encodeURIComponent(r.title)}&year=${r.year}&type=${r.type}&poster=${encodeURIComponent(r.posterUrl)}&tmdbId=${r.tmdbId}`;
}

function Thumb({ src, title }: { src: string; title: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="h-12 w-8 shrink-0 rounded-sm object-cover"
      loading="lazy"
    />
  ) : (
    <span className="flex h-12 w-8 shrink-0 items-center justify-center rounded-sm bg-card text-[8px] font-bold text-dim">
      {title.charAt(0).toUpperCase()}
    </span>
  );
}

export default function LiveSearch({
  variant = "nav",
  initialQuery = "",
  autoFocus = false,
}: {
  variant?: "nav" | "page";
  initialQuery?: string;
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState(initialQuery);
  const [lib, setLib] = useState<LibResult[]>([]);
  const [ext, setExt] = useState<ExtResult[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const items: Item[] = [
    ...lib.map((r) => ({ kind: "lib" as const, r })),
    ...ext.map((r) => ({ kind: "ext" as const, r })),
  ];

  // Debounced fetch-as-you-type
  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setLib([]);
      setExt([]);
      setOpen(false);
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
        };
        setLib(data.library);
        setExt(data.external ?? []);
        setActive(-1);
        setOpen(true);
      } catch {
        // aborted or offline — keep whatever is shown
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  // Close when clicking anywhere else
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      setOpen(false);
      router.push(itemHref(items[active]));
    }
  }

  const isNav = variant === "nav";

  return (
    <div ref={boxRef} className={`relative ${isNav ? "" : "w-full"}`}>
      <form action="/search">
        <input
          type="text"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={isNav ? "Search…" : "Search films and TV shows…"}
          autoComplete="off"
          autoFocus={autoFocus}
          className={
            isNav
              ? "!w-44 !rounded-full !bg-card !py-1.5 text-sm"
              : "!py-3 !text-lg"
          }
          aria-label="Search"
          aria-expanded={open}
        />
      </form>

      {open && (
        <div
          className={`absolute z-50 mt-2 overflow-hidden rounded-lg border border-line bg-panel shadow-xl ${
            isNav ? "right-0 w-80" : "w-full"
          }`}
        >
          {lib.length > 0 && (
            <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-dim">
              Reviews
            </p>
          )}
          {lib.map((r, i) => (
            <button
              key={r.id}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => {
                setOpen(false);
                router.push(`/entry/${r.id}`);
              }}
              className={`flex w-full items-center gap-3 px-3 py-2 text-left ${
                active === i ? "bg-card" : ""
              }`}
            >
              <Thumb src={r.posterUrl} title={r.title} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">
                  {r.title}
                </span>
                <span className="text-xs text-dim">
                  {r.year}
                  {r.type === "tv" && (
                    <span className="ml-1.5 rounded bg-card px-1 py-px text-[9px] font-bold uppercase text-lbblue">
                      TV{r.season ? ` · ${r.season}` : ""}
                    </span>
                  )}
                  {r.status === "watchlist" && (
                    <span className="ml-1.5 text-[10px] text-lbgreen">
                      watchlist
                    </span>
                  )}
                </span>
              </span>
              {r.rating != null && (
                <span className="shrink-0 text-xs font-bold text-lbgreen">
                  ★ {r.rating}
                </span>
              )}
            </button>
          ))}

          {ext.length > 0 && (
            <p className="border-t border-line px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-dim">
              Add from TMDB
            </p>
          )}
          {ext.map((r, i) => {
            const idx = lib.length + i;
            return (
              <button
                key={`${r.type}-${r.tmdbId}`}
                type="button"
                onMouseEnter={() => setActive(idx)}
                onClick={() => {
                  setOpen(false);
                  router.push(itemHref({ kind: "ext", r }));
                }}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left ${
                  active === idx ? "bg-card" : ""
                }`}
              >
                <Thumb src={r.posterUrl} title={r.title} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">
                    {r.title}
                  </span>
                  <span className="text-xs text-dim">
                    {r.year}
                    <span
                      className={`ml-1.5 rounded bg-card px-1 py-px text-[9px] font-bold uppercase ${
                        r.type === "tv" ? "text-lbblue" : "text-lborange"
                      }`}
                    >
                      {r.type === "tv" ? "TV" : "Film"}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-xs font-bold text-lbgreen">
                  + Log
                </span>
              </button>
            );
          })}

          {items.length === 0 && !loading && (
            <p className="px-3 py-3 text-sm text-dim">
              No matches for &ldquo;{q.trim()}&rdquo;
            </p>
          )}
          {loading && items.length === 0 && (
            <p className="px-3 py-3 text-sm text-dim">Searching…</p>
          )}
        </div>
      )}
    </div>
  );
}
