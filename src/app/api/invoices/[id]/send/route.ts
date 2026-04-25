import { NextRequest } from "next/server";
import { proxyInvoicesRequest } from "../../_helpers";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, context: Context) {
  const { id } = await context.params;
  return proxyInvoicesRequest(`/api/invoices/${id}/send`, {
    method: "POST",
    body: JSON.stringify(await req.json()),
  });
}
