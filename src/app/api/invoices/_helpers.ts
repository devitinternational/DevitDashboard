import { auth } from "@/auth";
import { getBackendBearerToken } from "@/lib/backend-auth";
import { isAdminRole } from "@/lib/authz";
import { NextResponse } from "next/server";

const API = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function getInvoicesBackendToken() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) return null;
  return getBackendBearerToken();
}

export async function proxyInvoicesRequest(
  path: string,
  init?: RequestInit,
) {
  const token = await getInvoicesBackendToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
