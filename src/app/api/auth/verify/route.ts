import { decode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await decode({
      token,
      secret: process.env.AUTH_SECRET!,
      salt: "authjs.session-token", // ← this is the key fix
    });

    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Optionally re-fetch role fresh from DB so role changes reflect immediately
    const user = await prisma.user.findUnique({
      where: { id: decoded.id as string },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}