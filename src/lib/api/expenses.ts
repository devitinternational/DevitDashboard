import { CreateExpenseInput, Expense, ExpenseFilters, ExpenseReport } from "@/types/expense";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchExpenses(token: string): Promise<Expense[]> {
  const res = await fetch(`${API_URL}/api/expenses`, {
    headers: await getHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch expenses");
  const data = await res.json();
  return data.expenses;
}

export async function fetchExpenseReport(
  token: string,
  filters: ExpenseFilters = {}
): Promise<ExpenseReport> {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.category) params.set("category", filters.category);
  if (filters.createdBy) params.set("createdBy", filters.createdBy);
  if (filters.minAmount) params.set("minAmount", filters.minAmount);
  if (filters.maxAmount) params.set("maxAmount", filters.maxAmount);

  const res = await fetch(`${API_URL}/api/expenses/report?${params}`, {
    headers: await getHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch report");
  return res.json();
}

export async function createExpense(
  token: string,
  data: CreateExpenseInput
): Promise<Expense> {
  const res = await fetch(`${API_URL}/api/expenses`, {
    method: "POST",
    headers: await getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create expense");
  const result = await res.json();
  return result.expense;
}

export async function updateExpense(
  token: string,
  id: string,
  data: Partial<CreateExpenseInput>
): Promise<Expense> {
  const res = await fetch(`${API_URL}/api/expenses/${id}`, {
    method: "PUT",
    headers: await getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update expense");
  const result = await res.json();
  return result.expense;
}

export async function deleteExpense(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/expenses/${id}`, {
    method: "DELETE",
    headers: await getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete expense");
}