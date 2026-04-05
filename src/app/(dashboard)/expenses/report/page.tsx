"use client";

import { useEffect, useState } from "react";
import { ExpenseSummaryCards } from "@/components/expenses/expense-summary-cards";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { useSearchParams } from "next/navigation";
import type { ExpenseFilters, ExpenseReport } from "@/types/expense";

export default function ExpenseReportPage() {
  const [report, setReport] = useState<ExpenseReport | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function loadReport(filters: ExpenseFilters) {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.from) params.set("from", filters.from);
        if (filters.to) params.set("to", filters.to);
        if (filters.category) params.set("category", filters.category);
        if (filters.createdBy) params.set("createdBy", filters.createdBy);
        if (filters.minAmount) params.set("minAmount", filters.minAmount);
        if (filters.maxAmount) params.set("maxAmount", filters.maxAmount);

        const query = params.toString();
        const res = await fetch(
          query ? `/api/expenses/report?${query}` : "/api/expenses/report",
        );
        const data = await res.json();
        setReport(data);
      } finally {
        setLoading(false);
      }
    }

    void loadReport({
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      createdBy: searchParams.get("createdBy") ?? undefined,
      minAmount: searchParams.get("minAmount") ?? undefined,
      maxAmount: searchParams.get("maxAmount") ?? undefined,
    });
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Expense Report</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Analyze expense data and open filters from the header when needed
        </p>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Loading report...</p>
      )}

      {report && !loading && (
        <div className="space-y-6">
          <ExpenseSummaryCards summary={report.summary} />
          <ExpenseTable
            expenses={report.expenses}
            onUpdate={async () => {
              const query = searchParams.toString();
              const res = await fetch(
                query ? `/api/expenses/report?${query}` : "/api/expenses/report",
              );
              const data = await res.json();
              setReport(data);
            }}
            onDelete={async () => {
              const query = searchParams.toString();
              const res = await fetch(
                query ? `/api/expenses/report?${query}` : "/api/expenses/report",
              );
              const data = await res.json();
              setReport(data);
            }}
          />
        </div>
      )}

      {!report && !loading && (
        <div className="text-center py-16 text-muted-foreground">
          Loading report...
        </div>
      )}
    </div>
  );
}
