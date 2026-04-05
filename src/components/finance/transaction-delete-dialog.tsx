"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
  kind: "expense" | "income";
};

export function TransactionDeleteDialog({
  open,
  onClose,
  onConfirm,
  loading,
  kind,
}: Props) {
  const label = kind === "expense" ? "expense" : "income entry";

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {kind === "expense" ? "Expense" : "Income"}</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The {label} will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
