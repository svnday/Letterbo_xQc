"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { RatingStars } from "./RatingStars";

interface ReviewFormProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  mediaTitle: string;
}

export function ReviewForm({ tmdbId, mediaType, mediaTitle }: ReviewFormProps) {
  const { data: session, status } = useSession();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    setLoading(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId,
          mediaType,
          rating,
          content: content.trim() || undefined,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setContent("");
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") return null;
  if (!session) {
    return (
      <p className="mt-6 text-zinc-500">
        <Link href="/login" className="text-amber-500 hover:underline">
          Log in
        </Link>{" "}
        to rate and review {mediaTitle}.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label className="block text-sm text-zinc-400 mb-2">Your rating</label>
        <RatingStars value={rating} onChange={setRating} />
      </div>
      <div>
        <label htmlFor="review" className="block text-sm text-zinc-400 mb-2">
          Review (optional)
        </label>
        <textarea
          id="review"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          rows={4}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
          placeholder="Write your thoughts..."
        />
      </div>
      <button
        type="submit"
        disabled={loading || rating === 0}
        className="px-4 py-2 bg-amber-500 text-zinc-950 font-medium rounded hover:bg-amber-400 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : success ? "Saved!" : "Save rating"}
      </button>
    </form>
  );
}
