"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MediaCard } from "@/components/MediaCard";

export default function SearchMoviesPage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<Array<{
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
    media_type: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/media?q=${encodeURIComponent(debounced)}&type=movie`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setResults([]);
        } else {
          setResults(data.results ?? []);
        }
      })
      .catch(() => {
        setError("Search failed. Please try again.");
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [debounced]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/search" className="text-zinc-500 hover:text-white transition text-sm">
          ← Back to search
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Search movies</h1>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search movies..."
        className="w-full max-w-xl px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        autoFocus
      />
      {loading && <p className="text-zinc-500 mt-2">Searching...</p>}
      {error && <p className="text-amber-500 mt-2">{error}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-8">
        {results.map((r) => (
          <MediaCard
            key={`${r.media_type}-${r.id}`}
            id={r.id}
            type="movie"
            title={(r.title ?? r.name) ?? "Untitled"}
            posterPath={r.poster_path}
            releaseDate={r.release_date ?? r.first_air_date}
          />
        ))}
      </div>
    </div>
  );
}
