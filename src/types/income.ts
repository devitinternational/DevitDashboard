export type Income = {
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

export type FinanceReport = {
  expenses: import("./expense").Expense[];
  incomes: Income[];
  summary: {
    totalExpensesINR: number;
    totalExpensesMYR: number;
    totalIncomeINR: number;
    totalIncomeMYR: number;
    netINR: number;
    netMYR: number;
    expenseCount: number;
    incomeCount: number;
    expenseByCategory: Record<string, { INR: number; MYR: number }>;
    incomeByCategory: Record<string, { INR: number; MYR: number }>;
  };
};

export type CreateIncomeInput = {
  title: string;
  category: string;
  description?: string;
  date: string;
  amountINR?: string;
  amountMYR?: string;
  inputCurrency: "INR" | "MYR";
};