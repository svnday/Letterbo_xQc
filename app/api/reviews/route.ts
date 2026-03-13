import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  mediaId: z.string().optional(),
  tmdbId: z.number(),
  mediaType: z.enum(["movie", "tv"]),
  rating: z.number().min(0).max(10),
  content: z.string().max(2000).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mediaId = searchParams.get("mediaId");
  const userId = searchParams.get("userId");

  if (mediaId) {
    const reviews = await prisma.review.findMany({
      where: { mediaId },
      include: { user: { select: { id: true, name: true, username: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reviews);
  }

  if (userId) {
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: { media: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reviews);
  }

  return NextResponse.json({ error: "Missing mediaId or userId" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { tmdbId, mediaType, rating, content } = parsed.data;
    let mediaId = parsed.data.mediaId;

    let media = await prisma.media.findUnique({
      where: { tmdbId },
    });
    if (!media) {
      const { getMovieById, getTvById } = await import("@/lib/tmdb");
      const data = mediaType === "movie"
        ? await getMovieById(tmdbId)
        : await getTvById(tmdbId);
      const title = "title" in data ? data.title : data.name;
      const releaseDate = "release_date" in data ? data.release_date : data.first_air_date;
      media = await prisma.media.create({
        data: {
          tmdbId,
          type: mediaType,
          title,
          overview: data.overview ?? null,
          posterPath: data.poster_path,
          releaseDate: releaseDate ?? null,
        },
      });
    }
    mediaId = media.id;

    const existing = await prisma.review.findUnique({
      where: {
        userId_mediaId: { userId: session.user.id, mediaId },
      },
    });

    if (existing) {
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: { rating, content: content ?? null },
      });
      return NextResponse.json(updated);
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        mediaId,
        rating,
        content: content ?? null,
      },
      include: { user: { select: { id: true, name: true, username: true, email: true } }, media: true },
    });
    return NextResponse.json(review);
  } catch (e) {
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
