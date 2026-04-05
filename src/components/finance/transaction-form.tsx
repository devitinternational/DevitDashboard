"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Landmark, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type TransactionFormInput = {
  title: string;
  category: string;
  description?: string;
  date: string;
  amount: string;
};

type TransactionDraft = TransactionFormInput & { id?: string };

type Props = {
  defaultValues?: TransactionDraft;
  onSubmit: (data: TransactionFormInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  kind: "expense" | "income";
};

const copy = {
  expense: {
    titlePlaceholder: "e.g. Team lunch",
    categoryPlaceholder: "e.g. Travel, Food, Software",
    amountLabel: "Amount (₹)",
    descriptionPlaceholder: "Add receipt notes, vendor details, or context...",
    icon: Wallet,
  },
  income: {
    titlePlaceholder: "e.g. Client payment",
    categoryPlaceholder: "e.g. Salary, Freelance, Refund",
    amountLabel: "Amount received (₹)",
    descriptionPlaceholder: "Add payout details, client info, or reference notes...",
    icon: Landmark,
  },
} as const;

export function TransactionForm({
  defaultValues,
  onSubmit,
  onCancel,
  loading,
  kind,
}: Props) {
  const [date, setDate] = useState<Date | undefined>(
    defaultValues?.date ? new Date(defaultValues.date) : undefined,
  );

  const form = useForm<TransactionFormInput>({
    defaultValues: {
      title: defaultValues?.title ?? "",
      category: defaultValues?.category ?? "",
      description: defaultValues?.description ?? "",
      amount: defaultValues?.amount ?? "",
      date: defaultValues?.date ?? "",
    },
  });

  const kindCopy = copy[kind];
  const Icon = kindCopy.icon;

  async function handleSubmit(values: TransactionFormInput) {
    if (!date) {
      form.setError("date", { message: "Date is required" });
      return;
    }

    await onSubmit({ ...values, date: date.toISOString() });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {defaultValues?.id ? "Update transaction details" : "Add a new transaction"}
              </p>
              <p className="text-sm text-muted-foreground">
                Keep entries structured so reports and category summaries stay clean.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder={kindCopy.titlePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder={kindCopy.categoryPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                rules={{ required: "Amount is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{kindCopy.amountLabel}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={() => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={kindCopy.descriptionPlaceholder}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : defaultValues?.id ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
