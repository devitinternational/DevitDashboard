"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  ArrowLeftRight,
  CalendarIcon,
  Landmark,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currency-store";

export type TransactionFormInput = {
  title: string;
  category: string;
  description?: string;
  date: string;
  amountINR?: string;
  amountMYR?: string;
  inputCurrency: "INR" | "MYR";
};

type TransactionDraft = Omit<TransactionFormInput, "inputCurrency"> & {
  id?: string;
  amountINR?: string;
  amountMYR?: string;
};

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
    descriptionPlaceholder: "Add receipt notes, vendor details, or context...",
    icon: Wallet,
  },
  income: {
    titlePlaceholder: "e.g. Client payment",
    categoryPlaceholder: "e.g. Salary, Freelance, Refund",
    descriptionPlaceholder:
      "Add payout details, client info, or reference notes...",
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
  const { rates } = useCurrencyStore();

  const [date, setDate] = useState<Date | undefined>(
    defaultValues?.date ? new Date(defaultValues.date) : undefined,
  );
  const [inputCurrency, setInputCurrency] = useState<"INR" | "MYR">("INR");
  const [convertedPreview, setConvertedPreview] = useState<string>("");

  const form = useForm<TransactionFormInput>({
    defaultValues: {
      title: defaultValues?.title ?? "",
      category: defaultValues?.category ?? "",
      description: defaultValues?.description ?? "",
      amountINR: defaultValues?.amountINR ?? "",
      amountMYR: defaultValues?.amountMYR ?? "",
      inputCurrency: "INR",
      date: defaultValues?.date ?? "",
    },
  });

  const kindCopy = copy[kind];
  const Icon = kindCopy.icon;

  function handleAmountChange(value: string) {
    if (!rates || !value) {
      setConvertedPreview("");
      return;
    }
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      setConvertedPreview("");
      return;
    }
    if (inputCurrency === "INR") {
      const myr = (num * rates.INR_TO_MYR).toFixed(2);
      setConvertedPreview(
        `≈ RM ${Number(myr).toLocaleString("en-MY", { minimumFractionDigits: 2 })}`,
      );
      return;
    }

    const inr = (num * rates.MYR_TO_INR).toFixed(2);
    setConvertedPreview(
      `≈ ₹${Number(inr).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    );
  }

  function toggleInputCurrency() {
    setInputCurrency((current) => (current === "INR" ? "MYR" : "INR"));
    setConvertedPreview("");
    form.setValue("amountINR", "");
    form.setValue("amountMYR", "");
  }

  async function handleSubmit(values: TransactionFormInput) {
    if (!date) {
      form.setError("date", { message: "Date is required" });
      return;
    }

    await onSubmit({ ...values, date: date.toISOString(), inputCurrency });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="overflow-hidden rounded-3xl border bg-[linear-gradient(180deg,hsl(var(--card)),hsl(var(--muted)/0.3))] shadow-sm">
          <div className="border-b bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.16),_transparent_40%)] px-5 py-5">
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
                <Icon className="size-4" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold">
                  {defaultValues?.id
                    ? `Update ${kind === "expense" ? "expense" : "income"} details`
                    : `Add a new ${kind === "expense" ? "expense" : "income"} entry`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Keep entries structured so reports and category summaries stay clean.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5">
            <Card className="border-0 bg-background/80 shadow-sm ring-1 ring-border/70">
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="size-4 text-primary" />
                  Core details
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={kindCopy.titlePlaceholder}
                          className="h-11 rounded-xl bg-background"
                          {...field}
                        />
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
                          <Input
                            placeholder={kindCopy.categoryPlaceholder}
                            className="h-11 rounded-xl bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={inputCurrency === "INR" ? "amountINR" : "amountMYR"}
                    rules={{ required: "Amount is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-3">
                          <FormLabel>
                            Amount ({inputCurrency === "INR" ? "₹ INR" : "RM MYR"})
                          </FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={toggleInputCurrency}
                            className="rounded-xl px-3 text-xs text-muted-foreground"
                          >
                            <ArrowLeftRight className="size-3.5" />
                            {inputCurrency === "INR" ? "Switch to MYR" : "Switch to INR"}
                          </Button>
                        </div>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="h-11 rounded-xl bg-background"
                            {...field}
                            onChange={(event) => {
                              field.onChange(event);
                              handleAmountChange(event.target.value);
                            }}
                          />
                        </FormControl>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span>{convertedPreview || "Converted preview appears here."}</span>
                          {rates ? (
                            <span>1 INR = MYR {rates.INR_TO_MYR.toFixed(4)}</span>
                          ) : null}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
              <Card className="border-0 bg-background/80 shadow-sm ring-1 ring-border/70">
                <CardContent className="space-y-4 p-4">
                  <div className="text-sm font-medium">Timing</div>
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
                                "h-11 w-full justify-start rounded-xl border-border bg-background text-left font-normal",
                                !date && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
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
                </CardContent>
              </Card>

              <Card className="border-0 bg-background/80 shadow-sm ring-1 ring-border/70">
                <CardContent className="space-y-4 p-4">
                  <div className="text-sm font-medium">Notes</div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={5}
                            placeholder={kindCopy.descriptionPlaceholder}
                            className="min-h-32 rounded-xl bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="rounded-xl shadow-sm">
                {loading ? "Saving..." : defaultValues?.id ? "Save changes" : "Create entry"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
