/**
 * Search-engine integration stub (TMDB-compatible).
 *
 * When you're ready, paste your API key into .env.local as TMDB_API_KEY.
 * The search page checks `searchConfigured()` and will automatically start
 * offering external movie/TV search once the key is present — poster URLs
 * and metadata can then be pulled straight into the log form.
 */

export interface ExternalResult {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  year: string;
  posterUrl: string;
  overview: string;
}

const API_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w342";

export function searchConfigured(): boolean {
  return Boolean(process.env.TMDB_API_KEY);
}

/**
 * Best-effort poster lookup for a single title, used to auto-fill artwork
 * when an entry is saved without a poster URL.
 */
export async function findPoster(
  title: string,
  year: string,
  type: "movie" | "tv"
): Promise<{ posterUrl: string; tmdbId: number } | null> {
  const key = process.env.TMDB_API_KEY;
  if (!key || !title.trim()) return null;

  const endpoint = type === "tv" ? "tv" : "movie";
  const yearParam =
    year && /^\d{4}$/.test(year)
      ? type === "tv"
        ? `&first_air_date_year=${year}`
        : `&year=${year}`
      : "";

  // The logged year may be a season year rather than the premiere year
  // (e.g. "Severance" logged as 2025 premiered in 2022), so if the
  // year-filtered search misses we retry without it.
  for (const filter of yearParam ? [yearParam, ""] : [""]) {
    const url = `${API_BASE}/search/${endpoint}?api_key=${key}&query=${encodeURIComponent(title)}${filter}&include_adult=false`;
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) continue;
      const data = await res.json();
      const hit = (data.results ?? []).find(
        (r: { poster_path?: string | null }) => r.poster_path
      );
      if (hit) return { posterUrl: IMG_BASE + hit.poster_path, tmdbId: hit.id };
    } catch {
      // network hiccup — fall through to the next attempt
    }
  }
  return null;
}

export async function searchExternal(query: string): Promise<ExternalResult[]> {
  const key = process.env.TMDB_API_KEY;
  if (!key || !query.trim()) return [];

  const url = `${API_BASE}/search/multi?api_key=${key}&query=${encodeURIComponent(query)}&include_adult=false`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return [];

  const data = await res.json();
  interface RawResult {
    id: number;
    media_type: string;
    title?: string;
    name?: string;
    release_date?: string;
    first_air_date?: string;
    poster_path?: string | null;
    overview?: string;
  }
  return (data.results as RawResult[])
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => ({
      tmdbId: r.id,
      type: r.media_type as "movie" | "tv",
      title: r.title ?? r.name ?? "Untitled",
      year: (r.release_date ?? r.first_air_date ?? "").slice(0, 4),
      posterUrl: r.poster_path ? IMG_BASE + r.poster_path : "",
      overview: r.overview ?? "",
    }));
}
