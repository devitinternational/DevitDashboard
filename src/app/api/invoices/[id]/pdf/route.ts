import { proxyInvoicesRequest } from "../../_helpers";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: Context) {
  const { id } = await context.params;
  return proxyInvoicesRequest(`/api/invoices/${id}/pdf`);
}
