# LetterboxQc

A Letterboxd-style site for rating and reviewing movies and TV shows.

## Features

- Browse trending movies and TV shows
- Search movies and TV via TMDB
- Rate (1–5 stars) and review
- User profiles with review history
- Auth with email/password

## Setup

1. **Copy env and add TMDB key**
   ```bash
   cp .env.example .env
   ```
   Get a free API key at [themoviedb.org](https://www.themoviedb.org/settings/api) and set `TMDB_API_KEY` in `.env`.

2. **Generate NextAuth secret**
   ```bash
   openssl rand -base64 32
   ```
   Put the result in `NEXTAUTH_SECRET` in `.env`.

3. **Install and run**
   ```bash
   npm install
   npm run db:generate
   npm run db:push
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

**If `npm run dev` shows 404 or broken layout** (webpack cache corruption): stop all dev servers, then run `npm run serve` instead. This builds and serves the production app, which always works.

## Tech Stack

- Next.js 14 (App Router)
- Prisma + SQLite
- NextAuth (credentials)
- Tailwind CSS
- TMDB API
