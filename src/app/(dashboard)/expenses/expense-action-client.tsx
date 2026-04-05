"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { ExpenseForm } from "@/components/expenses/expense-form";
import type { Expense, CreateExpenseInput } from "@/types/expense";

type Props = { userId: string };

export function ExpenseActionsClient({ userId }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      setExpenses(data.expenses ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(data: CreateExpenseInput) {
    setFormLoading(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      setCreating(false);
      await load();
    } finally {
      setFormLoading(false);
    }
  }

  async function handleUpdate(id: string, data: Partial<CreateExpenseInput>) {
    console.log("handleUpdate id:", id); // add this
    console.log("handleUpdate data:", data);
    const res = await fetch(`/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed");
    await load();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed");
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expense Actions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all expenses
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : (
        <ExpenseTable
          expenses={expenses}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
