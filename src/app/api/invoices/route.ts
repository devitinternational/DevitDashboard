import { NextRequest } from "next/server";
import { proxyInvoicesRequest } from "./_helpers";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.toString();
  return proxyInvoicesRequest(`/api/invoices${search ? `?${search}` : ""}`);
}
