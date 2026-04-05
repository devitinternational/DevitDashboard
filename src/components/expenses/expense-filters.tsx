"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ExpenseFilters } from "@/types/expense";

type Props = {
  initialFilters?: ExpenseFilters;
  onApply: (filters: ExpenseFilters) => void;
  onReset: () => void;
  loading?: boolean;
};

export function ExpenseFiltersForm({
  initialFilters,
  onApply,
  onReset,
  loading,
}: Props) {
  const [from, setFrom] = useState<Date | undefined>(
    initialFilters?.from ? new Date(initialFilters.from) : undefined,
  );
  const [to, setTo] = useState<Date | undefined>(
    initialFilters?.to ? new Date(initialFilters.to) : undefined,
  );
  const [category, setCategory] = useState(initialFilters?.category ?? "");
  const [createdBy, setCreatedBy] = useState(initialFilters?.createdBy ?? "");
  const [minAmount, setMinAmount] = useState(initialFilters?.minAmount ?? "");
  const [maxAmount, setMaxAmount] = useState(initialFilters?.maxAmount ?? "");

  function handleApply() {
    onApply({
      from: from?.toISOString(),
      to: to?.toISOString(),
      category: category || undefined,
      createdBy: createdBy || undefined,
      minAmount: minAmount || undefined,
      maxAmount: maxAmount || undefined,
    });
  }

  function handleReset() {
    setFrom(undefined);
    setTo(undefined);
    setCategory("");
    setCreatedBy("");
    setMinAmount("");
    setMaxAmount("");
    onReset();
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <span className="text-xs text-muted-foreground font-medium">From</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left", !from && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {from ? format(from, "dd MMM yy") : "Start date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={from} onSelect={setFrom} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2">
        <span className="text-xs text-muted-foreground font-medium">To</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left", !to && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {to ? format(to, "dd MMM yy") : "End date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={to} onSelect={setTo} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-1.5">
        <span className="text-xs text-muted-foreground font-medium">Category</span>
        <Input
          placeholder="e.g. Travel"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      <div className="grid gap-1.5">
        <span className="text-xs text-muted-foreground font-medium">Created by</span>
        <Input
          placeholder="Name or email"
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
        />
      </div>

      <div className="grid gap-1.5">
        <span className="text-xs text-muted-foreground font-medium">Amount range</span>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Min"
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
          <Input
            placeholder="Max"
            type="number"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={handleReset} disabled={loading}>
          <X className="mr-2 h-3.5 w-3.5" />
          Reset
        </Button>
        <Button onClick={handleApply} disabled={loading}>
          <Search className="mr-2 h-3.5 w-3.5" />
          Apply
        </Button>
      </div>
    </div>
  );
}
