"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { ReportFiltersBar } from "@/components/finance/report-filters-bar";
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

export function FinanceReportFiltersButton() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const isFinanceReportPage = pathname === "/finance/report";

  const filters = useMemo(
    () => readFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  if (!isFinanceReportPage) {
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
      <DialogContent className="max-w-3xl border-0 p-0 shadow-xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Finance Report Filters</DialogTitle>
          <DialogDescription>
            Refine income and expense results without taking over the page.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <ReportFiltersBar
            initialFilters={filters}
            onApply={updateRoute}
            onReset={() => updateRoute({})}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
