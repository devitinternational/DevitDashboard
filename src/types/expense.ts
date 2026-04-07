export type Expense = {
  id: string;
  title: string;
  category: string;
  description?: string | null;
  date: string;
  amountINR: string;
  amountMYR: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
};

export type ExpenseFilters = {
  from?: string;
  to?: string;
  category?: string;
  createdBy?: string;
  minAmount?: string;
  maxAmount?: string;
};

export type CreateExpenseInput = {
  title: string;
  category: string;
  description?: string;
  date: string;
  amountINR?: string;
  amountMYR?: string;
  inputCurrency: "INR" | "MYR";
};