"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, RotateCcw, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ExpenseFilters } from "@/types/expense";

type Props = {
  initialFilters?: ExpenseFilters;
  onApply: (filters: ExpenseFilters) => void;
  onReset: () => void;
  loading?: boolean;
};

export function ReportFiltersBar({
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
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-card via-card to-muted/40 shadow-sm ring-1 ring-border">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <SlidersHorizontal className="size-4" />
              </span>
              Refine your report
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Focus the finance view by date range, owner, category, or amount band.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              <RotateCcw className="mr-2 size-4" />
              Reset
            </Button>
            <Button onClick={handleApply} disabled={loading}>
              <Search className="mr-2 size-4" />
              {loading ? "Refreshing..." : "Apply filters"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        <DateField label="From" value={from} onChange={setFrom} placeholder="Start date" />
        <DateField label="To" value={to} onChange={setTo} placeholder="End date" />
        <Field label="Category">
          <Input
            placeholder="Travel, Ops, Freelance..."
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
        </Field>
        <Field label="Created by">
          <Input
            placeholder="Name or email"
            value={createdBy}
            onChange={(event) => setCreatedBy(event.target.value)}
          />
        </Field>
        <Field label="Minimum amount">
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={minAmount}
            onChange={(event) => setMinAmount(event.target.value)}
          />
        </Field>
        <Field label="Maximum amount">
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={maxAmount}
            onChange={(event) => setMaxAmount(event.target.value)}
          />
        </Field>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function DateField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  placeholder: string;
}) {
  return (
    <Field label={label}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "justify-start rounded-xl text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {value ? format(value, "dd MMM yyyy") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={value} onSelect={onChange} initialFocus />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
