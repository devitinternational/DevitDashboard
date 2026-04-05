import type { Expense, CreateExpenseInput } from "@/types/expense";
import { TransactionForm } from "@/components/finance/transaction-form";

type Props = {
  defaultValues?: Expense;
  onSubmit: (data: CreateExpenseInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export function ExpenseForm({
  defaultValues,
  onSubmit,
  onCancel,
  loading,
}: Props) {
  return (
    <TransactionForm
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      loading={loading}
      kind="expense"
    />
  );
}
