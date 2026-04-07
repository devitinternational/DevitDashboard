import { ReceiptText, Scale, Wallet2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ExpenseReport } from "@/types/expense";

type Props = {
  summary: ExpenseReport["summary"];
};

export function ExpenseSummaryCards({ summary }: Props) {
  const total = summary?.total ?? 0;
  const count = summary?.count ?? 0;
  const byCategory = summary?.byCategory ?? {};

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="border-0 bg-gradient-to-br from-rose-500/12 via-card to-card shadow-sm ring-1 ring-rose-500/15">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wallet2 className="size-4 text-rose-500" />
            Total Spent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-sky-500/12 via-card to-card shadow-sm ring-1 ring-sky-500/15">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ReceiptText className="size-4 text-sky-500" />
            Total Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{count}</p>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-amber-500/12 via-card to-card shadow-sm ring-1 ring-amber-500/15">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Scale className="size-4 text-amber-500" />
            Avg per Expense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            ₹
            {count > 0
              ? (total / count).toLocaleString("en-IN", { minimumFractionDigits: 2 })
              : "0.00"}
          </p>
        </CardContent>
      </Card>

      {Object.keys(byCategory).length > 0 && (
        <Card className="md:col-span-3 border-0 shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              By Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {Object.entries(byCategory).map(([cat, amount], i, arr) => (
                <div key={cat} className="flex items-center gap-6 rounded-2xl border bg-muted/30 px-4 py-3">
                  <div className="min-w-28">
                    <p className="text-xs text-muted-foreground">{cat}</p>
                    <p className="font-semibold">
                      ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  {i < arr.length - 1 && <Separator orientation="vertical" className="h-8" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
