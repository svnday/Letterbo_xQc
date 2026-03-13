"use client";

import { useState } from "react";

interface RatingStarsProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
}

export function RatingStars({ value, onChange, readOnly }: RatingStarsProps) {
  const [hover, setHover] = useState(0);
  const display = readOnly ? value : hover || value;

  return (
    <div
      className={`flex gap-0.5 ${readOnly ? "" : "cursor-pointer"}`}
      onMouseLeave={() => !readOnly && setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(star)}
          onClick={() => !readOnly && onChange?.(star)}
          className={`p-0.5 transition ${
            readOnly ? "cursor-default" : "hover:scale-110"
          }`}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <span
            className={`text-xl ${
              star <= display ? "text-amber-400" : "text-zinc-600"
            }`}
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
