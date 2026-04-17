"use client";

import { useState } from "react";
import { ReceiptText, History, FilePlus2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceListTable } from "./invoice-list-table";
import { InvoiceGeneratorPanel } from "./invoice-generator-panel";
import type { Invoice, DomainOption } from "@/types/invoice";

interface Props {
  invoices: Invoice[];
  domains: DomainOption[];
}

type Tab = "history" | "generate";

export function InvoicePageClient({ invoices, domains }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("history");

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View all issued invoices and generate new ones with a live PDF
            preview.
          </p>
        </div>
        <div className="hidden items-center gap-2 text-muted-foreground sm:flex">
          <ReceiptText className="h-5 w-5" />
          <span className="text-sm font-medium">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex gap-1 rounded-2xl bg-muted p-1 shadow-inner w-fit">
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="h-4 w-4" />
          History
          {invoices.length > 0 && (
            <span
              className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs ${
                activeTab === "history"
                  ? "bg-muted text-muted-foreground"
                  : "bg-background/60 text-muted-foreground"
              }`}
            >
              {invoices.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("generate")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "generate"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FilePlus2 className="h-4 w-4" />
          Generate
        </button>
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "history" ? (
        <Card className="border-0 shadow-sm ring-1 ring-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <History className="h-4 w-4 text-muted-foreground" />
              Invoice History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InvoiceListTable invoices={invoices} />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm ring-1 ring-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FilePlus2 className="h-4 w-4 text-muted-foreground" />
              Generate Invoice
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InvoiceGeneratorPanel domains={domains} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
