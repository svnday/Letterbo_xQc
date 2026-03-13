"use client";

import { useState } from "react";
import { MediaTypeahead } from "./MediaTypeahead";

interface ReviewComposeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewComposeForm({ onSuccess, onCancel }: ReviewComposeFormProps) {
  const [selected, setSelected] = useState<{ tmdbId: number; type: "movie" | "tv"; title: string } | null>(null);
  const [score, setScore] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleRatingChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (v === "" || /^\d*\.?\d*$/.test(v)) setScore(v);
  }

  function isValidRating(): boolean {
    const num = parseFloat(score);
    return !isNaN(num) && num >= 0 && num <= 10 && isFinite(num);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) {
      setError("Please select a movie or TV show");
      return;
    }
    const numScore = parseFloat(score);
    if (!isValidRating()) {
      setError("Rating must be a positive number (0–10)");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: selected.tmdbId,
          mediaType: selected.type,
          rating: numScore,
          content: content.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save review");
        return;
      }
      setSelected(null);
      setScore("");
      setContent("");
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-zinc-400 mb-2">Movie or TV show</label>
        <MediaTypeahead
          onSelect={setSelected}
          placeholder="Type to search..."
        />
        {selected && (
          <p className="mt-1 text-sm text-amber-500">Selected: {selected.title}</p>
        )}
      </div>
      <div>
        <label htmlFor="score" className="block text-sm text-zinc-400 mb-2">
          Rating (positive number, 0–10)
        </label>
        <input
          id="score"
          type="text"
          inputMode="decimal"
          value={score}
          onChange={handleRatingChange}
          placeholder="e.g. 7.5"
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <div>
        <label htmlFor="review" className="block text-sm text-zinc-400 mb-2">
          Review
        </label>
        <textarea
          id="review"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={5000}
          rows={6}
          placeholder="Write your full review..."
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !selected || !score || !isValidRating()}
          className="px-4 py-2 bg-amber-500 text-zinc-950 font-medium rounded hover:bg-amber-400 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Publish review"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-zinc-700 text-zinc-200 rounded hover:bg-zinc-600 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
