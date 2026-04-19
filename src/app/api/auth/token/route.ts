import { NextRequest, NextResponse } from "next/server";
<<<<<<< HEAD
import { auth } from "@/auth";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const session = await auth();
=======
import { getBackendBearerToken } from "@/lib/backend-auth";

export async function GET(req: NextRequest) {
  const token = await getBackendBearerToken();
>>>>>>> origin/main

  if (!session?.user) {
    return NextResponse.json({ token: null }, { status: 401 });
  }

  // Sign a JWT that the backend verifyToken middleware expects
  const token = jwt.sign(
    {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      name: session.user.name,
    },
    process.env.BACKEND_AUTH_SECRET || "change-me",
    { expiresIn: "1d" }
  );

  return NextResponse.json({ token });
}
