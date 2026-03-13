"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ComposeModal } from "./ComposeModal";

export function ComposeButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") return null;
  if (!session) {
    return (
      <p className="text-zinc-500">
        <Link href="/login" className="text-amber-500 hover:underline">
          Log in
        </Link>{" "}
        to write a review.
      </p>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-6 py-2 bg-amber-500 text-zinc-950 font-medium rounded hover:bg-amber-400 transition"
      >
        Review something
      </button>
      <ComposeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
