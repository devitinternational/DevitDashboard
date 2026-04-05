import {
  TransactionForm,
  type TransactionFormInput as FinanceFormInput,
} from "@/components/finance/transaction-form";

type Props = {
  defaultValues?: FinanceFormInput & { id?: string };
  onSubmit: (data: FinanceFormInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  kind: "expense" | "income";
};

export function FinanceForm({
  defaultValues,
  onSubmit,
  onCancel,
  loading,
  kind,
}: Props) {
  return (
    <TransactionForm
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      loading={loading}
      kind={kind}
    />
  );
}

export type { FinanceFormInput };
