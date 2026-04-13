import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Auth.js stores the JWT in this cookie — just forward it as-is
  const token = req.cookies.get("authjs.session-token")?.value;

  if (!token) {
    return NextResponse.json({ token: null }, { status: 401 });
  }

  return NextResponse.json({ token });
}