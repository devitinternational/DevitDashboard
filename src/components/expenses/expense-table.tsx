"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExpenseForm } from "./expense-form";
import { ExpenseDeleteDialog } from "./expense-delete-dialog";
import type { Expense, CreateExpenseInput } from "@/types/expense";

type Props = {
  expenses: Expense[];
  onUpdate: (id: string, data: Partial<CreateExpenseInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function ExpenseTable({ expenses, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpdate(data: CreateExpenseInput) {
    if (!editing) return;
    setLoading(true);
    await onUpdate(editing.id, data);
    setLoading(false);
    setEditing(null);
  }

  async function handleDelete() {
    if (!deleting) return;
    setLoading(true);
    await onDelete(deleting.id);
    setLoading(false);
    setDeleting(null);
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="w-12.5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No expenses found.
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.title}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell>{format(new Date(expense.date), "dd MMM yyyy")}</TableCell>
                  <TableCell>₹{Number(expense.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {expense.createdBy.name ?? expense.createdBy.email}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(expense)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleting(expense)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {editing && (
            <ExpenseForm
              defaultValues={editing}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <ExpenseDeleteDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}
