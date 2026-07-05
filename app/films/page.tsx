import { publicEntries } from "@/lib/db";
import MediaGrid from "@/components/MediaGrid";

export default async function FilmsPage() {
  const films = (await publicEntries())
    .filter((e) => e.type === "movie" && e.status === "logged")
    .sort((a, b) => b.watchedDate.localeCompare(a.watchedDate));

  return (
    <MediaGrid
      title="Films reviewed"
      entries={films}
      emptyText="No films reviewed yet."
    />
  );
}
