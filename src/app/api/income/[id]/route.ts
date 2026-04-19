import { auth } from "@/auth";
import { getBackendBearerToken } from "@/lib/backend-auth";
import { isAdminRole } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.BACKEND_URL ?? "http://localhost:4000";

async function getBackendToken() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) return null;
  return getBackendBearerToken();
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getBackendToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${API}/api/incomes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getBackendToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${API}/api/incomes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
