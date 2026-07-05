"use client";

import { useState } from "react";
import { saveEntry } from "@/lib/actions";
import type { Entry } from "@/lib/db";
import { StarSvg } from "./Stars";

function StarInput({ initial }: { initial: number | null }) {
  const [rating, setRating] = useState<number>(initial ?? 0);
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? rating;
  const SIZE = 32;

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name="rating" value={rating || ""} />
      <div className="flex" onMouseLeave={() => setHover(null)}>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = shown >= i ? 1 : shown >= i - 0.5 ? 0.5 : 0;
          return (
            <button
              key={i}
              type="button"
              className="relative cursor-pointer"
              style={{ width: SIZE, height: SIZE }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHover(e.clientX - rect.left < rect.width / 2 ? i - 0.5 : i);
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const val = e.clientX - rect.left < rect.width / 2 ? i - 0.5 : i;
                setRating(val === rating ? 0 : val);
              }}
              aria-label={`${i} stars`}
            >
              <span className="absolute inset-0">
                <StarSvg className="text-[#3a4551]" />
              </span>
              {fill > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: fill === 1 ? SIZE : SIZE / 2 }}
                >
                  <span className="block" style={{ width: SIZE, height: SIZE }}>
                    <StarSvg className="text-lbgreen" />
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <span className="min-w-14 text-sm text-dim">
        {shown ? `${shown} / 5` : "Not rated"}
      </span>
      {rating > 0 && (
        <button
          type="button"
          onClick={() => setRating(0)}
          className="text-xs text-dim underline hover:text-white"
        >
          clear
        </button>
      )}
    </div>
  );
}

function Toggle({
  name,
  label,
  accent,
  defaultChecked,
}: {
  name: string;
  label: string;
  accent: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-current"
        style={{ color: accent }}
      />
      <span className="text-mute">{label}</span>
    </label>
  );
}

export default function EntryForm({
  entry,
  error,
  prefill,
}: {
  entry?: Entry;
  error?: string;
  prefill?: Partial<Entry>;
}) {
  const [type, setType] = useState<"movie" | "tv">(
    entry?.type ?? prefill?.type ?? "movie"
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={saveEntry} className="space-y-5">
      {entry && <input type="hidden" name="id" value={entry.id} />}
      {prefill?.tmdbId && (
        <input type="hidden" name="tmdbId" value={prefill.tmdbId} />
      )}
      <input type="hidden" name="type" value={type} />

      {error && (
        <p className="rounded border border-lborange/40 bg-lborange/10 px-3 py-2 text-sm text-lborange">
          {error}
        </p>
      )}

      {/* Movie / TV toggle */}
      <div className="inline-flex overflow-hidden rounded border border-line">
        {(["movie", "tv"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-5 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
              type === t
                ? "bg-lbgreen text-[#14181c]"
                : "bg-panel text-dim hover:text-white"
            }`}
          >
            {t === "movie" ? "Film" : "TV Show"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-dim">
            Title
          </span>
          <input
            type="text"
            name="title"
            required
            defaultValue={entry?.title ?? prefill?.title ?? ""}
            placeholder={type === "tv" ? "e.g. Severance" : "e.g. Parasite"}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-dim">
            Year
          </span>
          <input
            type="text"
            name="year"
            defaultValue={entry?.year ?? prefill?.year ?? ""}
            placeholder="2024"
          />
        </label>
      </div>

      {type === "tv" && (
        <label className="block sm:w-1/2">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-dim">
            Season <span className="normal-case text-dim/60">(optional)</span>
          </span>
          <input
            type="text"
            name="season"
            defaultValue={entry?.season ?? ""}
            placeholder="e.g. Season 2, or leave blank for whole series"
          />
        </label>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-dim">
            Watched on
          </span>
          <input
            type="date"
            name="watchedDate"
            defaultValue={entry?.watchedDate ?? today}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-dim">
            Poster URL <span className="normal-case text-dim/60">(optional)</span>
          </span>
          <input
            type="url"
            name="posterUrl"
            defaultValue={entry?.posterUrl ?? prefill?.posterUrl ?? ""}
            placeholder="https://…"
          />
        </label>
      </div>

      <div>
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-dim">
          Rating
        </span>
        <StarInput initial={entry?.rating ?? null} />
      </div>

      <div className="flex flex-wrap gap-6">
        <Toggle name="liked" label="♥ Liked it" accent="#ff8000" defaultChecked={entry?.liked} />
        <Toggle name="rewatch" label="⟳ Rewatch" accent="#40bcf4" defaultChecked={entry?.rewatch} />
        <Toggle
          name="watchlist"
          label="Save to watchlist (haven't watched yet)"
          accent="#00e054"
          defaultChecked={entry?.status === "watchlist"}
        />
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-dim">
          Review
        </span>
        <textarea
          name="review"
          rows={6}
          defaultValue={entry?.review ?? ""}
          placeholder="What did you think?"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-dim">
          Tags <span className="normal-case text-dim/60">(comma-separated)</span>
        </span>
        <input
          type="text"
          name="tags"
          defaultValue={entry?.tags.join(", ") ?? ""}
          placeholder="horror, a24, rewatch-worthy"
        />
      </label>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          className="rounded bg-lbgreen px-6 py-2.5 font-bold text-[#14181c] hover:brightness-110"
        >
          {entry ? "SAVE CHANGES" : "SAVE"}
        </button>
      </div>
    </form>
  );
}
