import { publicEntries } from "@/lib/db";
import MediaGrid from "@/components/MediaGrid";

export default async function ShowsPage() {
  const shows = (await publicEntries())
    .filter((e) => e.type === "tv" && e.status === "logged")
    .sort((a, b) => b.watchedDate.localeCompare(a.watchedDate));

  return (
    <MediaGrid
      title="TV shows reviewed"
      entries={shows}
      emptyText="No TV shows reviewed yet."
    />
  );
}
