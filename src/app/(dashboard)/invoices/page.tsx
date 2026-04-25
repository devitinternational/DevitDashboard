import { auth } from "@/auth";
import { InvoicePageClient } from "@/components/invoices/invoice-page-client";

export const metadata = { title: "Invoices | Admin Dashboard" };

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return <InvoicePageClient />;
}
