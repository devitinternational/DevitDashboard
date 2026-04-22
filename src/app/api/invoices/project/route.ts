import { NextRequest } from "next/server";
import { proxyInvoicesRequest } from "../_helpers";

export async function POST(req: NextRequest) {
  return proxyInvoicesRequest("/api/invoices/project", {
    method: "POST",
    body: JSON.stringify(await req.json()),
  });
}
