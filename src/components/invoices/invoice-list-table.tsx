"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Download, ExternalLink, RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Invoice } from "@/types/invoice";

interface Props {
  invoices: Invoice[];
}

export function InvoiceListTable({ invoices }: Props) {
  const [regenerating, setRegenerating] = useState<string | null>(null);

  async function handleDownload(invoice: Invoice) {
    if (!invoice.pdfUrl) {
      toast.error("No PDF available for this invoice.");
      return;
    }
    window.open(invoice.pdfUrl, "_blank", "noopener,noreferrer");
  }

  async function handleRegenerate(invoice: Invoice) {
    setRegenerating(invoice.id);
    try {
      toast.info(`Regeneration for ${invoice.invoiceNo} is handled by the backend payment flow.`);
    } finally {
      setRegenerating(null);
    }
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No invoices yet</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Invoices are created automatically when a learner completes payment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice No</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>GST</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>PDF</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {invoice.invoiceNo}
                </span>
              </TableCell>

              <TableCell>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{invoice.buyerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {invoice.buyerEmail}
                  </p>
                </div>
              </TableCell>

              <TableCell className="max-w-48">
                <p className="truncate text-sm">{invoice.courseTitle}</p>
              </TableCell>

              <TableCell className="font-medium">
                ₹{Number(invoice.amountINR).toFixed(2)}
              </TableCell>

              <TableCell className="text-muted-foreground">
                ₹{Number(invoice.gstAmount).toFixed(2)}
                <span className="ml-1 text-xs">({invoice.gstPercent}%)</span>
              </TableCell>

              <TableCell className="font-semibold">
                ₹{Number(invoice.total).toFixed(2)}
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(invoice.issuedAt), "dd MMM yyyy")}
              </TableCell>

              <TableCell>
                {invoice.pdfUrl ? (
                  <Badge
                    variant="outline"
                    className="border-green-300 bg-green-50 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  >
                    Ready
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-amber-300 bg-amber-50 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                  >
                    Pending
                  </Badge>
                )}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(invoice)}
                    disabled={!invoice.pdfUrl}
                    title="Open invoice PDF"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRegenerate(invoice)}
                    disabled={regenerating === invoice.id}
                    title="Regenerate PDF"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${regenerating === invoice.id ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
