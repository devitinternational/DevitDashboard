"use client";

import { useEffect, useMemo, useState } from "react";
import { format, startOfDay, endOfDay, startOfMonth, subDays } from "date-fns";
import {
  FilePlus2,
  History,
  ReceiptText,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { InvoiceGeneratorPanel } from "./invoice-generator-panel";
import { InvoiceListTable } from "./invoice-list-table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchInvoiceDetail, fetchInvoiceMeta, fetchInvoicePdfUrl, fetchInvoices, sendInvoice } from "@/lib/api/invoices";
import { cn } from "@/lib/utils";
import type {
  DomainOption,
  InvoiceHistoryFilters,
  InvoiceListItem,
  InvoiceMetaResponse,
} from "@/types/invoice";

type Tab = "history" | "create";
type DatePreset = "all" | "today" | "last7" | "month" | "single" | "range";

const DEFAULT_FILTERS: InvoiceHistoryFilters = {
  search: "",
  domain: "",
  type: "",
  status: "",
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export function InvoicePageClient() {
  const [activeTab, setActiveTab] = useState<Tab>("history");
  const [filters, setFilters] = useState<InvoiceHistoryFilters>(DEFAULT_FILTERS);
  const [preset, setPreset] = useState<DatePreset>("all");
  const [singleDate, setSingleDate] = useState<Date | undefined>();
  const [rangeStart, setRangeStart] = useState<Date | undefined>();
  const [rangeEnd, setRangeEnd] = useState<Date | undefined>();
  const [meta, setMeta] = useState<InvoiceMetaResponse["data"] | null>(null);
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    async function loadMeta() {
      try {
        const response = await fetchInvoiceMeta();
        setMeta(response.data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load invoice metadata");
      }
    }

    void loadMeta();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetchInvoices(filters);
        setInvoices(response.data);
        setTotal(response.pagination.total);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [filters]);

  const domainOptions: DomainOption[] = meta?.domains ?? [];
  const invoiceCountLabel = useMemo(() => `${total} invoice${total === 1 ? "" : "s"}`, [total]);
  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.search.trim()) count += 1;
    if (preset !== "all") count += 1;
    if (filters.domain) count += 1;
    if (filters.type) count += 1;
    if (filters.status) count += 1;

    return count;
  }, [filters.domain, filters.search, filters.status, filters.type, preset]);

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setPreset("all");
    setSingleDate(undefined);
    setRangeStart(undefined);
    setRangeEnd(undefined);
  }

  function setDateFilter(nextPreset: DatePreset, payload?: { start?: Date; end?: Date }) {
    const nextFilters = { ...filters, page: 1 };
    const now = new Date();
    let startDate: string | undefined;
    let endDate: string | undefined;

    switch (nextPreset) {
      case "today":
        startDate = startOfDay(now).toISOString();
        endDate = endOfDay(now).toISOString();
        setSingleDate(undefined);
        setRangeStart(undefined);
        setRangeEnd(undefined);
        break;
      case "last7":
        startDate = startOfDay(subDays(now, 6)).toISOString();
        endDate = endOfDay(now).toISOString();
        setSingleDate(undefined);
        setRangeStart(undefined);
        setRangeEnd(undefined);
        break;
      case "month":
        startDate = startOfMonth(now).toISOString();
        endDate = endOfDay(now).toISOString();
        setSingleDate(undefined);
        setRangeStart(undefined);
        setRangeEnd(undefined);
        break;
      case "single":
        if (payload?.start) {
          startDate = startOfDay(payload.start).toISOString();
          endDate = endOfDay(payload.start).toISOString();
        }
        break;
      case "range":
        if (payload?.start) startDate = startOfDay(payload.start).toISOString();
        if (payload?.end) endDate = endOfDay(payload.end).toISOString();
        break;
      default:
        setSingleDate(undefined);
        setRangeStart(undefined);
        setRangeEnd(undefined);
        break;
    }

    setPreset(nextPreset);
    setFilters({
      ...nextFilters,
      startDate,
      endDate,
    });
  }

  async function handleDownload(invoice: InvoiceListItem) {
    try {
      setActionId(invoice.id);
      const response = await fetchInvoicePdfUrl(invoice.id);
      window.open(response.data.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to open invoice PDF");
    } finally {
      setActionId(null);
    }
  }

  async function handleResend(invoice: InvoiceListItem) {
    try {
      setActionId(invoice.id);
      const detail = await fetchInvoiceDetail(invoice.id);
      const recipients = detail.data.recipients.length ? detail.data.recipients : [detail.data.email];
      await sendInvoice(invoice.id, {
        emails: recipients,
        subject: detail.data.emailSubject ?? undefined,
        emailTemplate: detail.data.emailTemplate,
        mode: "send",
      });
      toast.success(`Invoice ${invoice.invoiceNumber} resent.`);
      const response = await fetchInvoices(filters);
      setInvoices(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend invoice");
    } finally {
      setActionId(null);
    }
  }

  function handleSort(sortBy: InvoiceHistoryFilters["sortBy"]) {
    setFilters((current) => ({
      ...current,
      page: 1,
      sortBy,
      sortOrder:
        current.sortBy === sortBy && current.sortOrder === "desc" ? "asc" : "desc",
    }));
  }

  function handleSavedInvoice() {
    setActiveTab("history");
    setFilters((current) => ({ ...current, page: 1 }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Backend-driven invoice history, manual invoice creation, PDF download, and resend workflows.
          </p>
        </div>
        <div className="hidden items-center gap-2 text-muted-foreground sm:flex">
          <ReceiptText className="h-5 w-5" />
          <span className="text-sm font-medium">{invoiceCountLabel}</span>
        </div>
      </div>

      <div className="flex gap-1 rounded-2xl bg-muted p-1 shadow-inner w-fit">
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="h-4 w-4" />
          Invoice History
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "create"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FilePlus2 className="h-4 w-4" />
          Create Invoice
        </button>
      </div>

      {activeTab === "history" ? (
        <div className="space-y-5">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-card via-card to-muted/40 shadow-sm ring-1 ring-border">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <SlidersHorizontal className="size-4" />
                    </span>
                    Refine invoice history
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Search and filter through invoices with backend pagination and sorting.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <SlidersHorizontal className="mr-2 size-4" />
                        Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Invoice Filters</DialogTitle>
                        <DialogDescription>
                          Refine invoice history without taking over the page layout.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Search">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              placeholder="Invoice, name, email, project, domain..."
                              value={filters.search}
                              onChange={(event) =>
                                setFilters((current) => ({
                                  ...current,
                                  search: event.target.value,
                                  page: 1,
                                }))
                              }
                            />
                          </div>
                        </Field>

                        <Field label="Date Filter">
                          <Select value={preset} onValueChange={(value) => setDateFilter(value as DatePreset)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All time</SelectItem>
                              <SelectItem value="today">Today</SelectItem>
                              <SelectItem value="last7">Last 7 days</SelectItem>
                              <SelectItem value="month">This month</SelectItem>
                              <SelectItem value="single">Single date</SelectItem>
                              <SelectItem value="range">Custom range</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>

                        <Field label="Domain">
                          <Select
                            value={filters.domain || "__all__"}
                            onValueChange={(value) =>
                              setFilters((current) => ({
                                ...current,
                                domain: value === "__all__" ? "" : value,
                                page: 1,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All domains" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all__">All domains</SelectItem>
                              {domainOptions.map((option) => (
                                <SelectItem key={option.id} value={option.title}>
                                  {option.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>

                        <Field label="Invoice Type">
                          <Select
                            value={filters.type || "__all__"}
                            onValueChange={(value) =>
                              setFilters((current) => ({
                                ...current,
                                type: value === "__all__" ? "" : (value as InvoiceHistoryFilters["type"]),
                                page: 1,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all__">All types</SelectItem>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="project">Project</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>

                        <Field label="Status">
                          <Select
                            value={filters.status || "__all__"}
                            onValueChange={(value) =>
                              setFilters((current) => ({
                                ...current,
                                status:
                                  value === "__all__" ? "" : (value as InvoiceHistoryFilters["status"]),
                                page: 1,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all__">All statuses</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="sent">Sent</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>

                        {preset === "single" ? (
                          <DateField
                            label="Date"
                            value={singleDate}
                            placeholder="Pick a date"
                            onChange={(date) => {
                              setSingleDate(date);
                              if (date) setDateFilter("single", { start: date });
                            }}
                          />
                        ) : null}

                        {preset === "range" ? (
                          <>
                            <DateField
                              label="Start Date"
                              value={rangeStart}
                              placeholder="Start date"
                              onChange={(date) => {
                                setRangeStart(date);
                                if (date || rangeEnd) setDateFilter("range", { start: date, end: rangeEnd });
                              }}
                            />
                            <DateField
                              label="End Date"
                              value={rangeEnd}
                              placeholder="End date"
                              onChange={(date) => {
                                setRangeEnd(date);
                                if (rangeStart || date) setDateFilter("range", { start: rangeStart, end: date });
                              }}
                            />
                          </>
                        ) : null}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" onClick={resetFilters}>
                    <RotateCcw className="mr-2 size-4" />
                    Reset
                  </Button>
                </div>
              </div>
              {activeFilterCount ? (
                <p className="text-sm text-muted-foreground">
                  {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"} applied.
                </p>
              ) : null}
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <History className="h-4 w-4 text-muted-foreground" />
                Invoice History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InvoiceListTable
                invoices={invoices}
                filters={filters}
                total={total}
                loading={loading}
                actionId={actionId}
                onSort={handleSort}
                onPageChange={(page) =>
                  setFilters((current) => ({ ...current, page: Math.max(1, page) }))
                }
                onDownload={handleDownload}
                onResend={handleResend}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-0 shadow-sm ring-1 ring-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FilePlus2 className="h-4 w-4 text-muted-foreground" />
              Create Invoice
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {meta ? (
              <InvoiceGeneratorPanel
                domains={meta.domains}
                studentSources={meta.studentSources}
                defaultEmailTemplate={meta.defaultEmailTemplate}
                onInvoiceSaved={handleSavedInvoice}
              />
            ) : (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Loading invoice builder…
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
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
