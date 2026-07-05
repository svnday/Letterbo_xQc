import Link from "next/link";
import { signUp } from "@/lib/actions";
import { signupsOpen } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getCurrentUser()) redirect("/");
  const { error } = await searchParams;

  if (!signupsOpen()) {
    return (
      <div className="mx-auto max-w-sm py-16 text-center">
        <h1 className="mb-3 text-2xl font-bold text-white">Sign-ups are closed</h1>
        <p className="text-sm text-dim">
          You don&rsquo;t need an account to read the reviews — everything on
          this site is public.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded bg-lbgreen px-6 py-2.5 font-bold text-[#14181c] hover:brightness-110"
        >
          Browse reviews
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-1 text-2xl font-bold text-white">Create your account</h1>
      <p className="mb-6 text-sm text-dim">
        Accounts are for viewers — no account is needed just to read the
        reviews. Passwords must be at least 10 characters.
      </p>

      {error && (
        <p className="mb-4 rounded border border-lborange/40 bg-lborange/10 px-3 py-2 text-sm text-lborange">
          {error}
        </p>
      )}

      <form action={signUp} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-dim">
            Username
          </span>
          <input type="text" name="username" required placeholder="moviebuff" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-dim">
            Display name <span className="normal-case text-dim/60">(optional)</span>
          </span>
          <input type="text" name="displayName" placeholder="How your name appears" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-dim">
            Password
          </span>
          <input type="password" name="password" required minLength={10} />
        </label>
        <button
          type="submit"
          className="w-full rounded bg-lbgreen py-2.5 font-bold text-[#14181c] hover:brightness-110"
        >
          SIGN UP
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-dim">
        Already have an account?{" "}
        <Link href="/signin" className="text-lbblue hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
