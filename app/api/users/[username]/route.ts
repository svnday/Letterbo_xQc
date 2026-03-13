import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: username }, { id: username }],
    },
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      createdAt: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    include: { media: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ user, reviews });
}
