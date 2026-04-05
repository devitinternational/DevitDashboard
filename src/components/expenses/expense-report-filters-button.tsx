"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { ExpenseFiltersForm } from "@/components/expenses/expense-filters";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ExpenseFilters } from "@/types/expense";

function readFilters(searchParams: URLSearchParams): ExpenseFilters {
  return {
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    createdBy: searchParams.get("createdBy") ?? undefined,
    minAmount: searchParams.get("minAmount") ?? undefined,
    maxAmount: searchParams.get("maxAmount") ?? undefined,
  };
}

export function ExpenseReportFiltersButton() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const isExpenseReportPage = pathname === "/expenses/report";

  const filters = useMemo(
    () => readFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  if (!isExpenseReportPage) {
    return null;
  }

  function updateRoute(nextFilters: ExpenseFilters) {
    const params = new URLSearchParams();

    if (nextFilters.from) params.set("from", nextFilters.from);
    if (nextFilters.to) params.set("to", nextFilters.to);
    if (nextFilters.category) params.set("category", nextFilters.category);
    if (nextFilters.createdBy) params.set("createdBy", nextFilters.createdBy);
    if (nextFilters.minAmount) params.set("minAmount", nextFilters.minAmount);
    if (nextFilters.maxAmount) params.set("maxAmount", nextFilters.maxAmount);

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Expense Report Filters</DialogTitle>
          <DialogDescription>
            Narrow the report without taking over the page layout.
          </DialogDescription>
        </DialogHeader>
        <ExpenseFiltersForm
          initialFilters={filters}
          onApply={updateRoute}
          onReset={() => updateRoute({})}
        />
      </DialogContent>
    </Dialog>
  );
}
