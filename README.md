# LetterboxQC

A personal Letterboxd-style journal for **films and TV shows** — rate, review,
tag and diary everything you watch.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000, create your account, and start logging.

## Features

- **Sign up / sign in** — cookie sessions, bcrypt-hashed passwords.
- **Log films *and* TV shows** — including per-season logging for series.
- **Half-star ratings**, liked ♥, rewatch ⟳, tags, and full written reviews.
- **Diary** — everything you've watched, grouped by month.
- **Watchlist** — save things you haven't seen yet.
- **Profile** — stats, ratings histogram, and your favourites.
- **Search** — searches your library today; drop your API key into
  `.env.local` (`TMDB_API_KEY=...`) and it also searches the full external
  movie/TV catalogue with one-click logging and automatic posters
  (see `lib/tmdb.ts`).

## Where data lives

Storage is **Postgres via Drizzle ORM**, running on an embedded engine
(PGlite) that persists to `data/pg/` — no external service or account needed.
Back up the `data/` folder and you've backed up everything.

### Deploying with hosted Postgres

Set `DATABASE_URL` (Neon, Supabase, Vercel Postgres, any Postgres) and the
app switches to it automatically — schema and queries are identical in both
modes. Tables are created on first boot.

## Admin scripts

Run these from the project root (stop the dev server first when using the
local store — PGlite allows one process at a time). They also work against
`DATABASE_URL` when it's set.

```bash
npm run create-owner -- <username> <password> [displayName]  # create the reviewer account (sets password)
npm run promote-user -- <username>                           # make an existing account the featured reviewer
npm run set-password -- <username> <newPassword>             # reset a password
npm run rename-user  -- <username> <newUsername>             # change a sign-in / byline name
npm run set-display-name -- <username> <name>                # change the public display name
npm run delete-user  -- <username>                           # remove a viewer account
```

## Handing the site to its reviewer

The homepage publishes whichever account holds the featured-reviewer flag.
To hand the site over (e.g. the admin set it up, the personality reviews):

1. Set `SIGNUPS_OPEN=true` (in Vercel env for production) so they can register.
2. They sign up with their own username and password.
3. `DATABASE_URL=... npm run promote-user -- <their username>` — the homepage
   becomes their feed (allow up to 5 minutes for caches). Their password is
   untouched, and the previous reviewer's entries leave the public site.
4. Set `SIGNUPS_OPEN=false` again to close registration.

## Launch checklist

1. Create the production database, set `DATABASE_URL`.
2. `npm run create-owner -- <username> <strong password>` — never leave
   `ALLOW_OWNER_CLAIM=true` set on a public deployment.
3. Set `SIGNUPS_OPEN=false` unless you want public viewer accounts.
4. Serve over HTTPS (the session cookie is `secure` in production).
5. Auth endpoints are rate-limited in-process; for serious traffic put a
   WAF/edge rate limit in front as well.
