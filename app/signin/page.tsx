import Link from "next/link";
import { signIn } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getCurrentUser()) redirect("/");
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-6 text-2xl font-bold text-white">Sign in</h1>

      {error && (
        <p className="mb-4 rounded border border-lborange/40 bg-lborange/10 px-3 py-2 text-sm text-lborange">
          {error}
        </p>
      )}

      <form action={signIn} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-dim">
            Username
          </span>
          <input type="text" name="username" required autoFocus />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-dim">
            Password
          </span>
          <input type="password" name="password" required />
        </label>
        <button
          type="submit"
          className="w-full rounded bg-lbgreen py-2.5 font-bold text-[#14181c] hover:brightness-110"
        >
          SIGN IN
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-dim">
        New here?{" "}
        <Link href="/signup" className="text-lbblue hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
