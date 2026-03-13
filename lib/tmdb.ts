const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function getTmdbImageUrl(path: string | null, size: "w92" | "w185" | "w342" | "w500" | "original" = "w500") {
  if (!path) return "/placeholder-poster.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

async function fetchTmdb<T>(path: string): Promise<T> {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error("TMDB_API_KEY is not set");
  }
  const res = await fetch(`${TMDB_BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${key}`);
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status}`);
  }
  return res.json();
}

export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
}

export interface TmdbTvShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
}

export interface TmdbSearchResult {
  page: number;
  results: Array<{
    id: number;
    title?: string;
    name?: string;
    overview: string;
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
    media_type: string;
  }>;
}

export async function searchTmdb(query: string): Promise<TmdbSearchResult> {
  const encoded = encodeURIComponent(query);
  const res = await Promise.all([
    fetchTmdb<TmdbSearchResult>(`/search/movie?query=${encoded}`),
    fetchTmdb<TmdbSearchResult>(`/search/tv?query=${encoded}`),
  ]);
  const [movies, tv] = res;
  const combined = {
    page: 1,
    results: [
      ...movies.results.map((r) => ({ ...r, media_type: "movie" as const })),
      ...tv.results.map((r) => ({ ...r, media_type: "tv" as const })),
    ],
  };
  return combined;
}

export async function getMovieById(id: number): Promise<TmdbMovie> {
  return fetchTmdb<TmdbMovie>(`/movie/${id}`);
}

export async function getTvById(id: number): Promise<TmdbTvShow> {
  return fetchTmdb<TmdbTvShow>(`/tv/${id}`);
}

export async function getTrendingMovies(): Promise<{ results: TmdbMovie[] }> {
  return fetchTmdb<{ results: TmdbMovie[] }>("/trending/movie/day");
}

export async function getTrendingTv(): Promise<{ results: TmdbTvShow[] }> {
  return fetchTmdb<{ results: TmdbTvShow[] }>("/trending/tv/day");
}

export async function getPopularMovies(): Promise<{ results: TmdbMovie[] }> {
  return fetchTmdb<{ results: TmdbMovie[] }>("/movie/popular");
}
