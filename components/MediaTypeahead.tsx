"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { getTmdbImageUrl } from "@/lib/tmdb";

interface Suggestion {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: string;
}

interface MediaTypeaheadProps {
  onSelect: (item: { tmdbId: number; type: "movie" | "tv"; title: string }) => void;
  placeholder?: string;
}

export function MediaTypeahead({ onSelect, placeholder = "Search movies or TV shows..." }: MediaTypeaheadProps) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    fetch(`/api/media?q=${encodeURIComponent(debounced)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results ?? []);
        setOpen(true);
        setHighlighted(0);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debounced]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(item: Suggestion) {
    const title = (item.title ?? item.name) ?? "Untitled";
    onSelect({
      tmdbId: item.id,
      type: item.media_type as "movie" | "tv",
      title,
    });
    setQuery(title);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">Searching...</span>
      )}
      {open && results.length > 0 && (
        <ul
          className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto bg-zinc-900 border border-zinc-700 rounded shadow-xl"
          role="listbox"
        >
          {results.map((item, i) => {
            const title = (item.title ?? item.name) ?? "Untitled";
            const type = item.media_type === "movie" ? "Movie" : "TV";
            const year = (item.release_date ?? item.first_air_date)?.slice(0, 4);
            return (
              <li
                key={`${item.media_type}-${item.id}`}
                role="option"
                aria-selected={i === highlighted}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlighted(i)}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
                  i === highlighted ? "bg-zinc-800" : "hover:bg-zinc-800/50"
                }`}
              >
                <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-zinc-800">
                  <Image
                    src={item.poster_path ? getTmdbImageUrl(item.poster_path, "w92") : "/placeholder-poster.svg"}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{title}</p>
                  <p className="text-zinc-500 text-sm">
                    {type} {year ? `· ${year}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
