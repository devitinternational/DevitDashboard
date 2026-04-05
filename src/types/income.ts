export type Income = {
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

export type FinanceReport = {
  expenses: import("./expense").Expense[];
  incomes: Income[];
  summary: {
    totalExpenses: number;
    totalIncome: number;
    net: number;
    expenseCount: number;
    incomeCount: number;
    expenseByCategory: Record<string, number>;
    incomeByCategory: Record<string, number>;
  };
};

export type CreateIncomeInput = {
  title: string;
  category: string;
  description?: string;
  date: string;
  amount: string;
};