import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const API = process.env.BACKEND_URL ?? "http://localhost:4000";

async function getBackendToken() {
  const session = await auth();
  if (!session?.user) return null;
  return jwt.sign(
    { id: session.user.id, email: session.user.email, role: session.user.role, name: session.user.name },
    process.env.AUTH_SECRET!,
    { expiresIn: "1m" }
  );
}

export async function GET() {
  const token = await getBackendToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${API}/api/incomes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function POST(req: NextRequest) {
  const token = await getBackendToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${API}/api/incomes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}