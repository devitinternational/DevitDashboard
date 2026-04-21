import { NextRequest, NextResponse } from "next/server";
import { getBackendBearerToken } from "@/lib/backend-auth";

export async function GET(req: NextRequest) {
  const token = await getBackendBearerToken();

  if (!token) {
    return NextResponse.json({ token: null }, { status: 401 });
  }

  return NextResponse.json({ token });
}
