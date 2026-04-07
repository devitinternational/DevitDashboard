"use client";

import { useEffect, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Plus, WalletCards } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FinanceForm, FinanceFormInput } from "@/components/finance/finance-form";
import { ActionPageSkeleton } from "@/components/finance/page-skeletons";
import { TransactionTable } from "@/components/finance/transaction-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense } from "@/types/expense";
import type { Income } from "@/types/income";
import { Separator } from "@/components/ui/separator";

export default function FinanceActionPage() {
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  async function loadExpenses() {
    const res = await fetch("/api/expenses");
    if (!res.ok) {
      throw new Error("Unable to load expenses");
    }
    const data = await res.json();
    setExpenses(data.expenses ?? []);
  }

  async function loadIncomes() {
    const res = await fetch("/api/income");
    if (!res.ok) {
      throw new Error("Unable to load income entries");
    }
    const data = await res.json();
    setIncomes(data.incomes ?? []);
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        await Promise.all([loadExpenses(), loadIncomes()]);
      } catch (error) {
        toast.error(getErrorMessage(error, "Could not load finance records."));
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  async function handleCreate(data: FinanceFormInput) {
    setFormLoading(true);
    try {
      const endpoint = activeTab === "expense" ? "/api/expenses" : "/api/income";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error(await getResponseMessage(res, `Failed to create ${activeTab}.`));
      }
      setCreating(false);
      if (activeTab === "expense") {
        await loadExpenses();
      } else {
        await loadIncomes();
      }
      toast.success(
        activeTab === "expense" ? "Expense created successfully." : "Income entry created successfully.",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, `Could not create ${activeTab}.`));
    } finally {
      setFormLoading(false);
    }
  }

  async function handleUpdateExpense(id: string, data: Partial<FinanceFormInput>) {
    const res = await fetch(`/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await getResponseMessage(res, "Failed to update expense."));
    }
    await loadExpenses();
    toast.success("Expense updated successfully.");
  }

  async function handleDeleteExpense(id: string) {
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      throw new Error(await getResponseMessage(res, "Failed to delete expense."));
    }
    await loadExpenses();
    toast.success("Expense deleted successfully.");
  }

  async function handleUpdateIncome(id: string, data: Partial<FinanceFormInput>) {
    const res = await fetch(`/api/income/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await getResponseMessage(res, "Failed to update income entry."));
    }
    await loadIncomes();
    toast.success("Income entry updated successfully.");
  }

  async function handleDeleteIncome(id: string) {
    const res = await fetch(`/api/income/${id}`, { method: "DELETE" });
    if (!res.ok) {
      throw new Error(await getResponseMessage(res, "Failed to delete income entry."));
    }
    await loadIncomes();
    toast.success("Income entry deleted successfully.");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Finance Actions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage expenses and income from one polished workspace.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} className="rounded-xl shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add {activeTab === "expense" ? "expense" : "income"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-emerald-500/10 via-card to-card shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ArrowUpCircle className="size-4 text-emerald-500" />
              Total income entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{incomes.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Tracked inflows ready for reporting.</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-rose-500/10 via-card to-card shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ArrowDownCircle className="size-4 text-rose-500" />
              Total expense entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{expenses.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Outgoing transactions organized in one place.</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-sky-500/10 via-card to-card shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <WalletCards className="size-4 text-sky-500" />
              Active view
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold capitalize">{activeTab}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New entries will open in the shared finance form.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-1 rounded-2xl bg-muted p-1 shadow-inner w-fit">
        <button
          onClick={() => setActiveTab("expense")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "expense"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveTab("income")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "income"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Income
        </button>
      </div>

      <Separator />

      {loading && expenses.length === 0 && incomes.length === 0 ? (
        <ActionPageSkeleton />
      ) : activeTab === "expense" ? (
        <TransactionTable
          items={expenses}
          kind="expense"
          onUpdate={handleUpdateExpense}
          onDelete={handleDeleteExpense}
        />
      ) : (
        <TransactionTable
          items={incomes}
          kind="income"
          onUpdate={handleUpdateIncome}
          onDelete={handleDeleteIncome}
        />
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Add {activeTab === "expense" ? "Expense" : "Income"}
            </DialogTitle>
          </DialogHeader>
          <FinanceForm
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
            loading={formLoading}
            kind={activeTab}
          />
        </DialogContent>
      </Dialog>
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
