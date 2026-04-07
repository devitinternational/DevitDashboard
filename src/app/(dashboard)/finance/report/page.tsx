"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeftRight,
  ArrowUpRight,
  BadgeIndianRupee,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { ReportPageSkeleton } from "@/components/finance/page-skeletons";
import { TransactionTable } from "@/components/finance/transaction-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCurrencyStore } from "@/store/currency-store";
import type { ExpenseFilters } from "@/types/expense";
import type { FinanceReport } from "@/types/income";

export default function FinanceReportPage() {
  const [report, setReport] = useState<FinanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const searchParams = useSearchParams();
  const currency = useCurrencyStore((state) => state.currency);
  const toggleCurrency = useCurrencyStore((state) => state.toggle);

  useEffect(() => {
    void loadReport({
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      createdBy: searchParams.get("createdBy") ?? undefined,
      minAmount: searchParams.get("minAmount") ?? undefined,
      maxAmount: searchParams.get("maxAmount") ?? undefined,
    });
  }, [searchParams]);

  async function loadReport(nextFilters: ExpenseFilters) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (nextFilters.from) params.set("from", nextFilters.from);
      if (nextFilters.to) params.set("to", nextFilters.to);
      if (nextFilters.category) params.set("category", nextFilters.category);
      if (nextFilters.createdBy) params.set("createdBy", nextFilters.createdBy);
      if (nextFilters.minAmount) params.set("minAmount", nextFilters.minAmount);
      if (nextFilters.maxAmount) params.set("maxAmount", nextFilters.maxAmount);

      const query = params.toString();
      const res = await fetch(
        query ? `/api/finance/report?${query}` : "/api/finance/report",
      );
      if (!res.ok) {
        throw new Error(
          await getResponseMessage(res, "Failed to load finance report."),
        );
      }
      const data = await res.json();
      setReport(data);
      setFilters(nextFilters);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load the finance report."));
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateExpense(
    id: string,
    data: Partial<Record<string, string>>,
  ) {
    const res = await fetch(`/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await getResponseMessage(res, "Failed to update expense."));
    }
    toast.success("Expense updated successfully.");
    await loadReport(filters);
  }

  async function handleDeleteExpense(id: string) {
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      throw new Error(await getResponseMessage(res, "Failed to delete expense."));
    }
    toast.success("Expense deleted successfully.");
    await loadReport(filters);
  }

  async function handleUpdateIncome(
    id: string,
    data: Partial<Record<string, string>>,
  ) {
    const res = await fetch(`/api/income/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await getResponseMessage(res, "Failed to update income entry."));
    }
    toast.success("Income entry updated successfully.");
    await loadReport(filters);
  }

  async function handleDeleteIncome(id: string) {
    const res = await fetch(`/api/income/${id}`, { method: "DELETE" });
    if (!res.ok) {
      throw new Error(await getResponseMessage(res, "Failed to delete income entry."));
    }
    toast.success("Income entry deleted successfully.");
    await loadReport(filters);
  }

  function formatAmount(inr: number | undefined, myr: number | undefined) {
    if (currency === "MYR") {
      const value = myr ?? 0;
      return `RM ${value.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`;
    }

    const value = inr ?? 0;
    return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  }

  function formatDualLine(inr: number, myr: number) {
    return `INR ${inr.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })} · MYR ${myr.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`;
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.15),_transparent_34%),linear-gradient(145deg,hsl(var(--card)),hsl(var(--muted)/0.45))] shadow-sm ring-1 ring-border/70">
        <CardContent className="flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <BadgeIndianRupee className="size-3.5 text-primary" />
              Live finance reporting
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Finance Report</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Professional P&L reporting across both income and expense activity,
                with a cleaner dual-currency review built right into the page.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={toggleCurrency}
              className="rounded-xl bg-background/75"
            >
              <ArrowLeftRight className="size-4" />
              View in {currency === "INR" ? "MYR" : "INR"}
            </Button>
            <div className="rounded-2xl border bg-background/75 px-4 py-2 text-sm shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Current display
              </p>
              <p className="mt-1 font-semibold">{currency}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && !report ? <ReportPageSkeleton /> : null}

      {report && !loading && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-0 bg-gradient-to-br from-emerald-500/12 via-card to-card shadow-sm ring-1 ring-emerald-500/15">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatAmount(
                    report.summary.totalIncomeINR,
                    report.summary.totalIncomeMYR,
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDualLine(
                    report.summary.totalIncomeINR,
                    report.summary.totalIncomeMYR,
                  )}{" "}
                  · {report.summary.incomeCount} entries
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-rose-500/12 via-card to-card shadow-sm ring-1 ring-rose-500/15">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {formatAmount(
                    report.summary.totalExpensesINR,
                    report.summary.totalExpensesMYR,
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDualLine(
                    report.summary.totalExpensesINR,
                    report.summary.totalExpensesMYR,
                  )}{" "}
                  · {report.summary.expenseCount} entries
                </p>
              </CardContent>
            </Card>

            <Card
              className={
                report.summary.netINR >= 0
                  ? "border-0 bg-gradient-to-br from-sky-500/12 via-card to-card shadow-sm ring-1 ring-sky-500/15"
                  : "border-0 bg-gradient-to-br from-amber-500/12 via-card to-card shadow-sm ring-1 ring-amber-500/15"
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Net
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold ${
                    report.summary.netINR >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {report.summary.netINR >= 0 ? "+" : ""}
                  {formatAmount(report.summary.netINR, report.summary.netMYR)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {report.summary.netINR >= 0 ? (
                    <ArrowUpRight className="mr-1 inline size-3" />
                  ) : null}
                  {report.summary.netINR >= 0 ? "Surplus" : "Deficit"} ·{" "}
                  {formatDualLine(report.summary.netINR, report.summary.netMYR)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="border-0 shadow-sm ring-1 ring-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Income by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(report.summary.incomeByCategory).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(report.summary.incomeByCategory).map(
                      ([cat, amounts]) => (
                        <div
                          key={cat}
                          className="flex items-center justify-between rounded-2xl border bg-emerald-500/5 px-3 py-3"
                        >
                          <span className="text-sm">{cat}</span>
                          <div className="text-right">
                            <p className="text-sm font-medium text-emerald-600">
                              {formatAmount(amounts.INR, amounts.MYR)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDualLine(amounts.INR, amounts.MYR)}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm ring-1 ring-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(report.summary.expenseByCategory).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(report.summary.expenseByCategory).map(
                      ([cat, amounts]) => (
                        <div
                          key={cat}
                          className="flex items-center justify-between rounded-2xl border bg-rose-500/5 px-3 py-3"
                        >
                          <span className="text-sm">{cat}</span>
                          <div className="text-right">
                            <p className="text-sm font-medium text-rose-600">
                              {formatAmount(amounts.INR, amounts.MYR)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDualLine(amounts.INR, amounts.MYR)}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {report.incomes.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Income Entries</h2>
              <TransactionTable
                items={report.incomes}
                kind="income"
                onUpdate={handleUpdateIncome}
                onDelete={handleDeleteIncome}
              />
            </div>
          )}

          {report.expenses.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Expense Entries</h2>
              <TransactionTable
                items={report.expenses}
                kind="expense"
                onUpdate={handleUpdateExpense}
                onDelete={handleDeleteExpense}
              />
            </div>
          )}

          {report.expenses.length === 0 && report.incomes.length === 0 && (
            <Card className="border-dashed shadow-none">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Wallet className="size-5" />
                </span>
                <div>
                  <p className="font-medium">
                    No finance entries match these filters
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try broadening your date range or removing one of the amount constraints.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!report && !loading && (
        <Card className="border-dashed shadow-none">
          <CardContent className="py-16 text-center text-muted-foreground">
            Use the Filters button near search to refine and generate a P&L report.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

async function getResponseMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return data.error || data.message || fallback;
  } catch {
    return fallback;
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
