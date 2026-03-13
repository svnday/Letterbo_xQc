import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
  username: z.string().min(2).max(30).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password, name, username } = parsed.data;
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, ...(username ? [{ username }] : [])],
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: existing.email === email ? "Email already in use" : "Username already taken" },
        { status: 400 }
      );
    }
    const passwordHash = await hash(password, 12);
    const finalUsername = username?.trim() || email.split("@")[0]?.replace(/\W/g, "") || `user_${Date.now()}`;
    const user = await prisma.user.create({
      data: { email, passwordHash, name: name ?? null, username: finalUsername },
    });
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name ?? user.username ?? user.email,
    });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
