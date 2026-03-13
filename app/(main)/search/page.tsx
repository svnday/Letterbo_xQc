"use client";

import { useState, useEffect } from "react";
import { MediaCard } from "@/components/MediaCard";

export default function SearchPage() {
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

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`/api/media?q=${encodeURIComponent(debounced)}`)
      .then((res) => {
        return res.json().then((data) => {
          // #region agent log
          fetch('http://127.0.0.1:7618/ingest/dbeead2b-86a0-46b2-9eb4-57486b2f8048',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bc788d'},body:JSON.stringify({sessionId:'bc788d',location:'search/page.tsx:fetch',message:'Search response',data:{status:res.status,hasResults:!!data?.results,resultCount:data?.results?.length,hasError:!!data?.error},hypothesisId:'H3',timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          return { res, data };
        });
      })
      .then(({ res, data }) => setResults(data.results ?? []))
      .catch((err) => {
        fetch('http://127.0.0.1:7618/ingest/dbeead2b-86a0-46b2-9eb4-57486b2f8048',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bc788d'},body:JSON.stringify({sessionId:'bc788d',location:'search/page.tsx:catch',message:'Fetch error',data:{error:String(err)},hypothesisId:'H4',timestamp:Date.now()})}).catch(()=>{});
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [debounced]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search movies and TV shows..."
        className="w-full max-w-xl px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        autoFocus
      />
      {loading && <p className="text-zinc-500 mt-2">Searching...</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-8">
        {results.map((r) => (
          <MediaCard
            key={`${r.media_type}-${r.id}`}
            id={r.id}
            type={r.media_type as "movie" | "tv"}
            title={(r.title ?? r.name) ?? "Untitled"}
            posterPath={r.poster_path}
            releaseDate={r.release_date ?? r.first_air_date}
          />
        ))}
      </div>
    </div>
  );
}
