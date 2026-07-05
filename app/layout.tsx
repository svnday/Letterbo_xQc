import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "LetterboxQc",
  description: "Track films and TV shows you've watched. Save the ones you want to see.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Nav
          user={
            user
              ? {
                  username: user.username,
                  displayName: user.displayName,
                  isOwner: user.isOwner,
                }
              : null
          }
        />
        <main className="mx-auto max-w-5xl px-4 pb-24">{children}</main>
        <footer className="border-t border-line py-8 text-center text-xs text-dim">
          <p>LetterboxQc — films &amp; TV, tracked your way.</p>
          <p className="mt-2">
            This website uses{" "}
            <a
              href="https://www.themoviedb.org"
              className="text-lbblue hover:underline"
              rel="noreferrer"
              target="_blank"
            >
              TMDB
            </a>{" "}
            and the TMDB APIs but is not endorsed, certified, or otherwise
            approved by TMDB.
          </p>
        </footer>
      </body>
    </html>
  );
}
