import { NextResponse } from "next/server";

const API = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function GET() {
  const res = await fetch(`${API}/api/currency/rates`, {
    next: { revalidate: 60 }, // cache for 60s on Next.js side too
  });
  return NextResponse.json(await res.json(), { status: res.status });
}