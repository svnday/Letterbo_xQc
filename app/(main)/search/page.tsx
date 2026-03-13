import Link from "next/link";

export default function SearchPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Search</h1>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/search/movies"
          className="px-6 py-3 bg-amber-500 text-zinc-950 font-medium rounded-lg hover:bg-amber-400 transition"
        >
          Search movies
        </Link>
        <Link
          href="/search/tv"
          className="px-6 py-3 bg-amber-500 text-zinc-950 font-medium rounded-lg hover:bg-amber-400 transition"
        >
          Search TV shows
        </Link>
      </div>
    </div>
  );
}
