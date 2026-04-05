"use client";

import { useState, useCallback } from "react";
import { ExpenseFiltersForm } from "@/components/expenses/expense-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExpenseTable } from "@/components/expenses/expense-table";
import type { ExpenseFilters } from "@/types/expense";
import type { FinanceReport } from "@/types/income";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function FinanceReportPage() {
  const [report, setReport] = useState<FinanceReport | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFilter = useCallback(async (filters: ExpenseFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      if (filters.category) params.set("category", filters.category);
      if (filters.minAmount) params.set("minAmount", filters.minAmount);
      if (filters.maxAmount) params.set("maxAmount", filters.maxAmount);

      const res = await fetch(`/api/finance/report?${params}`);
      const data = await res.json();
      setReport(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finance Report</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Income vs expenses — P&L summary
        </p>
      </div>

      <ExpenseFiltersBar onFilter={handleFilter} loading={loading} />

      {loading && <p className="text-sm text-muted-foreground">Generating report...</p>}

      {report && !loading && (
        <div className="space-y-8">
          {/* P&L Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 dark:border-green-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {fmt(report.summary.totalIncome)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.summary.incomeCount} entries
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {fmt(report.summary.totalExpenses)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.summary.expenseCount} entries
                </p>
              </CardContent>
            </Card>

            <Card className={report.summary.net >= 0
              ? "border-green-200 dark:border-green-900"
              : "border-red-200 dark:border-red-900"
            }>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Net
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${
                  report.summary.net >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {report.summary.net >= 0 ? "+" : ""}{fmt(report.summary.net)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.summary.net >= 0 ? "Surplus" : "Deficit"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Income by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(report.summary.incomeByCategory).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(report.summary.incomeByCategory).map(([cat, amount]) => (
                      <div key={cat} className="flex justify-between items-center">
                        <span className="text-sm">{cat}</span>
                        <span className="text-sm font-medium text-green-600">{fmt(amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(report.summary.expenseByCategory).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(report.summary.expenseByCategory).map(([cat, amount]) => (
                      <div key={cat} className="flex justify-between items-center">
                        <span className="text-sm">{cat}</span>
                        <span className="text-sm font-medium text-red-600">{fmt(amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Income table */}
          {report.incomes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Income Entries</h2>
              <ExpenseTable
                expenses={report.incomes}
                onUpdate={async () => handleFilter({})}
                onDelete={async () => handleFilter({})}
              />
            </div>
          )}

          {/* Expense table */}
          {report.expenses.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Expense Entries</h2>
              <ExpenseTable
                expenses={report.expenses}
                onUpdate={async () => handleFilter({})}
                onDelete={async () => handleFilter({})}
              />
            </div>
          )}
        </div>
      )}

      {!report && !loading && (
        <div className="text-center py-16 text-muted-foreground">
          Apply filters above to generate a P&L report.
        </div>
      )}
    </div>
  );
}