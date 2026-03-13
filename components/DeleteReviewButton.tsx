"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteReviewButtonProps {
  reviewId: string;
}

export function DeleteReviewButton({ reviewId }: DeleteReviewButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Failed to delete review");
      }
    } catch {
      alert("Failed to delete review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-zinc-500 hover:text-red-400 text-sm transition disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
