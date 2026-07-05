import { getOwner, publicEntries } from "@/lib/db";
import MediaGrid from "@/components/MediaGrid";

export default async function WatchlistPage() {
  const owner = await getOwner();
  const wanted = (await publicEntries())
    .filter((e) => e.status === "watchlist")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <MediaGrid
      title={owner ? `What ${owner.displayName} wants to watch next` : "Watchlist"}
      entries={wanted}
      emptyText="Nothing on the watchlist right now."
    />
  );
}
