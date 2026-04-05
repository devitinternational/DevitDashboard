export type Expense = {
  id: string;
  title: string;
  category: string;
  description?: string | null;
  date: string;
  amount: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
};

export type ExpenseReport = {
  expenses: Expense[];
  summary: {
    total: number;
    count: number;
    byCategory: Record<string, number>;
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
  amount: string;
};