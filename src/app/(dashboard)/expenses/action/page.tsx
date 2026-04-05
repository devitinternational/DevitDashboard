import { auth } from "@/auth";
import { ExpenseActionsClient } from "../expense-action-client";

export default async function ExpenseActionsPage() {
  const session = await auth();
  return <ExpenseActionsClient userId={session?.user?.id ?? ""} />;
}