"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { ReviewComposeForm } from "./ReviewComposeForm";

interface ComposeModalProps {
  open: boolean;
  onClose: () => void;
}

export function ComposeModal({ open, onClose }: ComposeModalProps) {
  const { data: session, status } = useSession();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Review something</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {status === "loading" ? (
          <p className="text-zinc-500">Loading...</p>
        ) : !session ? (
          <p className="text-zinc-400">
            <Link href="/login" className="text-amber-500 hover:underline">
              Log in
            </Link>{" "}
            to write a review.
          </p>
        ) : (
          <ReviewComposeForm onSuccess={onClose} onCancel={onClose} />
        )}
      </div>
    </div>
  );
}
