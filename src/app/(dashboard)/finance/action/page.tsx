"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { FinanceForm, FinanceFormInput } from "@/components/finance/finance-form";
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

  const loadExpenses = useCallback(async () => {
    const res = await fetch("/api/expenses");
    const data = await res.json();
    setExpenses(data.expenses ?? []);
  }, []);

  const loadIncomes = useCallback(async () => {
    const res = await fetch("/api/incomes");
    const data = await res.json();
    setIncomes(data.incomes ?? []);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadExpenses(), loadIncomes()]).finally(() => setLoading(false));
  }, [loadExpenses, loadIncomes]);

  async function handleCreate(data: FinanceFormInput) {
    setFormLoading(true);
    try {
      const endpoint = activeTab === "expense" ? "/api/expenses" : "/api/incomes";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      setCreating(false);
      activeTab === "expense" ? await loadExpenses() : await loadIncomes();
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
    if (!res.ok) throw new Error("Failed");
    await loadExpenses();
  }

  async function handleDeleteExpense(id: string) {
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed");
    await loadExpenses();
  }

  async function handleUpdateIncome(id: string, data: Partial<FinanceFormInput>) {
    const res = await fetch(`/api/incomes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed");
    await loadIncomes();
  }

  async function handleDeleteIncome(id: string) {
    const res = await fetch(`/api/incomes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed");
    await loadIncomes();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Finance Actions</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage expenses and income</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add {activeTab === "expense" ? "Expense" : "Income"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit">
        <button
          onClick={() => setActiveTab("expense")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === "expense"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveTab("income")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === "income"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Income
        </button>
      </div>

      <Separator />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : activeTab === "expense" ? (
        <ExpenseTable
          expenses={expenses}
          onUpdate={handleUpdateExpense}
          onDelete={handleDeleteExpense}
        />
      ) : (
        <ExpenseTable
          expenses={incomes}
          onUpdate={handleUpdateIncome}
          onDelete={handleDeleteIncome}
        />
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Add {activeTab === "expense" ? "Expense" : "Income"}
            </DialogTitle>
          </DialogHeader>
          <FinanceForm
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
            loading={formLoading}
            amountLabel={activeTab === "expense" ? "Amount (₹)" : "Amount Received (₹)"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}