# LetterboxQc

A Letterboxd-style site for rating and reviewing movies and TV shows.

## Features

- Browse trending movies and TV shows
- Search movies and TV via TMDB
- Rate (1–5 stars) and review
- User profiles with review history
- Auth with email/password
- Home feed with reviews and artwork
- Delete your own reviews

## Setup

### Prerequisites

- Node.js 18+
- npm (comes with Node.js)

### 1. Clone and install

```bash
git clone <repo-url>
cd Letterbo_xQc
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:

- **TMDB_API_KEY** — Get a free API key at [themoviedb.org](https://www.themoviedb.org/settings/api)
- **NEXTAUTH_SECRET** — Generate one with:
  ```bash
  openssl rand -base64 32
  ```
- **NEXTAUTH_URL** — Leave as `http://localhost:3000` for local dev
- **FEATURED_USERNAME** (optional) — Username to feature on the home feed (default: `xQc`)

### 3. Set up the database

```bash
npm run db:generate
npm run db:push
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**If `npm run dev` shows 404 or broken layout** (webpack cache corruption): stop all dev servers, then run `npm run serve` instead. This builds and serves the production app, which always works.

## Testing locally

Once the dev server is running at http://localhost:3000:

1. **Create an account** — Click "Sign up" (or go to `/register`). Enter email, password, and optionally name and username. Submit to register and auto-login.

2. **Log in** — If you already have an account, use "Log in" (or `/login`) with your email and password.

3. **Browse content** — Use the nav to go to Movies or TV. Browse trending titles or use the search bar to find specific movies or shows.

4. **Rate and review** — Open a movie or TV page, pick a star rating, add optional review text, and submit. Your review appears on the media page and your profile.

5. **Home feed** — The home page shows reviews from the featured user (and recent activity). Each review displays with poster artwork and links to the media.

6. **Your profile** — Visit `/u/your-username` to see your review history. You can delete your own reviews from the media page or your profile.

7. **Search** — Use the search bar in the nav to find movies (`/search/movies`) or TV shows (`/search/tv`) by title.

## Tech Stack

- Next.js 14 (App Router)
- Prisma + SQLite
- NextAuth (credentials)
- Tailwind CSS
- TMDB API
