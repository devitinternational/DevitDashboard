import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const API = process.env.BACKEND_URL ?? "http://localhost:4000";

async function getBackendToken() {
  const session = await auth();
  if (!session?.user) return null;

  return jwt.sign(
    {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      name: session.user.name,
    },
    process.env.AUTH_SECRET!,
    { expiresIn: "1m" }
  );
}

export async function GET(req: NextRequest) {
  const token = await getBackendToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const res = await fetch(`${API}/api/expenses/report?${searchParams}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return NextResponse.json(await res.json(), { status: res.status });
}