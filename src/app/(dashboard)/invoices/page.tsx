import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InvoicePageClient } from "@/components/invoices/invoice-page-client";
import type { Invoice, DomainOption } from "@/types/invoice";

export const metadata = { title: "Invoices | Admin Dashboard" };

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [dbInvoices, dbDomains] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { issuedAt: "desc" },
    }),
    prisma.domain.findMany({
      select: {
        id: true,
        title: true,
        priceINR: true,
        isFree: true,
        durationOptions: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Map to matching types
  const invoices: Invoice[] = dbInvoices.map((inv) => ({
    id: inv.id,
    invoiceNo: inv.invoiceNo,
    enrollmentId: inv.enrollmentId,
    buyerName: inv.buyerName,
    buyerEmail: inv.buyerEmail,
    courseTitle: inv.courseTitle,
    amountINR: inv.amountINR.toString(),
    gstPercent: inv.gstPercent,
    gstAmount: inv.gstAmount.toString(),
    total: inv.total.toString(),
    pdfUrl: inv.pdfUrl,
    razorpayOrderId: inv.razorpayOrderId,
    razorpayPaymentId: inv.razorpayPaymentId,
    issuedAt: inv.issuedAt.toISOString(),
  }));

  const domains: DomainOption[] = dbDomains.map((d) => ({
    id: d.id,
    title: d.title,
    priceINR: d.priceINR?.toString() ?? null,
    isFree: d.isFree,
    durationOptions: d.durationOptions,
  }));

  return <InvoicePageClient invoices={invoices} domains={domains} />;
}
