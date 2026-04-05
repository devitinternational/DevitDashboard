import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ExpenseReport } from "@/types/expense";

type Props = {
  summary: ExpenseReport["summary"];
};

export function ExpenseSummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            ₹{summary.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.count}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg per Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            ₹{summary.count > 0
              ? (summary.total / summary.count).toLocaleString("en-IN", { minimumFractionDigits: 2 })
              : "0.00"}
          </p>
        </CardContent>
      </Card>

      {/* By category breakdown */}
      {Object.keys(summary.byCategory).length > 0 && (
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {Object.entries(summary.byCategory).map(([cat, amount], i, arr) => (
                <div key={cat} className="flex items-center gap-6">
                  <div>
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