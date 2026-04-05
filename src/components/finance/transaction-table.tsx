"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrencyStore } from "@/store/currency-store";
import { TransactionDeleteDialog } from "@/components/finance/transaction-delete-dialog";
import { TransactionForm, type TransactionFormInput } from "@/components/finance/transaction-form";

type TransactionRecord = {
  id: string;
  title: string;
  category: string;
  description?: string | null;
  date: string;
  amount: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
};

type Props = {
  items: TransactionRecord[];
  kind: "expense" | "income";
  onUpdate: (id: string, data: Partial<TransactionFormInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function TransactionTable({ items, kind, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<TransactionRecord | null>(null);
  const [deleting, setDeleting] = useState<TransactionRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const formatCurrency = useCurrencyStore((state) => state.format);

  async function handleUpdate(data: TransactionFormInput) {
    if (!editing) {
      return;
    }

    setLoading(true);
    try {
      await onUpdate(editing.id, data);
      setEditing(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleting) {
      return;
    }

    setLoading(true);
    try {
      await onDelete(deleting.id);
      setDeleting(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No {kind === "expense" ? "expenses" : "income entries"} found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="min-w-48">
                    <div className="space-y-1">
                      <p className="font-medium">{item.title}</p>
                      {item.description ? (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full border bg-muted/50 px-2.5 py-1 text-xs font-medium">
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell>{format(new Date(item.date), "dd MMM yyyy")}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(Number(item.amount))}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.createdBy.name ?? item.createdBy.email}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Open actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(item)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleting(item)}
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

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit {kind === "expense" ? "Expense" : "Income"}</DialogTitle>
            <DialogDescription>
              Update the transaction details and save changes.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <TransactionForm
              defaultValues={editing}
              kind={kind}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
              loading={loading}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <TransactionDeleteDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={loading}
        kind={kind}
      />
    </>
  );
}
