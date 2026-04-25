"use client";

import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  Download,
  FileText,
  Mail,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InvoiceHistoryFilters, InvoiceListItem } from "@/types/invoice";

type Props = {
  invoices: InvoiceListItem[];
  filters: InvoiceHistoryFilters;
  total: number;
  loading?: boolean;
  actionId?: string | null;
  onSort: (sortBy: InvoiceHistoryFilters["sortBy"]) => void;
  onPageChange: (page: number) => void;
  onDownload: (invoice: InvoiceListItem) => void;
  onResend: (invoice: InvoiceListItem) => void;
};

const statusClasses: Record<InvoiceListItem["status"], string> = {
  draft: "border-slate-300 bg-slate-50 text-slate-700",
  sent: "border-blue-300 bg-blue-50 text-blue-700",
  paid: "border-green-300 bg-green-50 text-green-700",
  failed: "border-red-300 bg-red-50 text-red-700",
};

export function InvoiceListTable({
  invoices,
  filters,
  total,
  loading,
  actionId,
  onSort,
  onPageChange,
  onDownload,
  onResend,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  if (!loading && invoices.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No invoices found</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Try broadening the filters or create a new invoice from the form tab.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead
                label="Invoice"
                sortBy="invoiceNumber"
                filters={filters}
                onSort={onSort}
              />
              <SortableHead label="Name" sortBy="name" filters={filters} onSort={onSort} />
              <TableHead>Type</TableHead>
              <SortableHead
                label="Domain"
                sortBy="domain"
                filters={filters}
                onSort={onSort}
              />
              <SortableHead
                label="Amount"
                sortBy="amount"
                filters={filters}
                onSort={onSort}
              />
              <SortableHead
                label="Status"
                sortBy="status"
                filters={filters}
                onSort={onSort}
              />
              <SortableHead
                label="Created"
                sortBy="createdAt"
                filters={filters}
                onSort={onSort}
              />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="space-y-1">
                  <div className="font-mono text-xs font-semibold text-blue-700">
                    {invoice.invoiceNumber}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {invoice.projectName || invoice.courseName}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{invoice.name}</p>
                    <p className="text-xs text-muted-foreground">{invoice.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {invoice.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {invoice.domain || "Unassigned"}
                </TableCell>
                <TableCell className="font-semibold">
                  Rs. {invoice.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`capitalize ${statusClasses[invoice.status]}`}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(invoice.createdAt), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownload(invoice)}
                      disabled={loading && actionId === invoice.id}
                    >
                      <Download className="mr-2 size-4" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResend(invoice)}
                      disabled={loading && actionId === invoice.id}
                    >
                      {actionId === invoice.id ? (
                        <RefreshCw className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Mail className="mr-2 size-4" />
                      )}
                      Resend
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {(filters.page - 1) * filters.limit + 1}-
          {Math.min(filters.page * filters.limit, total)} of {total}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(filters.page - 1)}
            disabled={filters.page <= 1}
          >
            Previous
          </Button>
          <span>
            Page {filters.page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(filters.page + 1)}
            disabled={filters.page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function SortableHead({
  label,
  sortBy,
  filters,
  onSort,
}: {
  label: string;
  sortBy: InvoiceHistoryFilters["sortBy"];
  filters: InvoiceHistoryFilters;
  onSort: (sortBy: InvoiceHistoryFilters["sortBy"]) => void;
}) {
  const active = filters.sortBy === sortBy;

  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onSort(sortBy)}
        className="inline-flex items-center gap-1 font-medium"
      >
        {label}
        {active ? (
          filters.sortOrder === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : null}
      </button>
    </TableHead>
  );
}
