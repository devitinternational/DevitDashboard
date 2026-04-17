"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Download, FileText, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DomainOption, InvoicePDFData } from "@/types/invoice";

// Dynamically load the PDF preview (browser-only)
const InvoicePDFPreviewInner = dynamic(
  () =>
    import("./invoice-pdf-preview").then((mod) => mod.InvoicePDFPreviewInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading preview…</p>
      </div>
    ),
  },
);

const schema = z.object({
  invoiceNo: z.string().min(1, "Invoice number is required"),
  buyerName: z.string().min(1, "Buyer name is required"),
  buyerEmail: z.string().email("Enter a valid email"),
  domainId: z.string().min(1, "Select a course"),
  courseTitle: z.string().min(1, "Course title is required"),
  durationMonths: z.any().transform(Number),
  amountINR: z.any().transform(Number),
});

type FormValues = z.infer<typeof schema>;

const GST_PERCENT = 18;

function buildPreviewYear() {
  return new Date().getFullYear();
}

interface Props {
  domains: DomainOption[];
}

export function InvoiceGeneratorPanel({ domains }: Props) {
  const [showPreview, setShowPreview] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [previewData, setPreviewData] = useState<InvoicePDFData>({
    invoiceNo: `DEVIT-${buildPreviewYear()}-XXXXX`,
    issuedAt: new Date(),
    buyerName: "Buyer Name",
    buyerEmail: "buyer@example.com",
    courseTitle: "Course Title",
    durationMonths: 1,
    amountINR: 4999,
    gst: GST_PERCENT,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      invoiceNo: `DEVIT-${buildPreviewYear()}-`,
      buyerName: "",
      buyerEmail: "",
      domainId: "",
      courseTitle: "",
      durationMonths: 1,
      amountINR: 4999,
    },
  });

  const watchedValues = watch();

  // Sync form values → live preview (debounced by React re-render)
  const syncPreview = useCallback(() => {
    const vals = watchedValues;
    setPreviewData({
      invoiceNo: vals.invoiceNo || `DEVIT-${buildPreviewYear()}-XXXXX`,
      issuedAt: new Date(),
      buyerName: vals.buyerName || "Buyer Name",
      buyerEmail: vals.buyerEmail || "buyer@example.com",
      courseTitle: vals.courseTitle || "Course Title",
      durationMonths: vals.durationMonths || 1,
      amountINR: vals.amountINR || 0,
      gst: GST_PERCENT,
    });
  }, [watchedValues]);

  // When domain changes, auto-fill course + amount + duration
  function handleDomainChange(domainId: string) {
    setValue("domainId", domainId);
    const domain = domains.find((d) => d.id === domainId);
    if (domain) {
      setValue("courseTitle", domain.title);
      if (!domain.isFree && domain.priceINR) {
        setValue("amountINR", parseFloat(domain.priceINR));
      } else {
        setValue("amountINR", 0);
      }
      if (domain.durationOptions.length > 0) {
        setValue("durationMonths", domain.durationOptions[0]);
      }
    }
    syncPreview();
  }

  async function handleDownload(values: FormValues) {
    setDownloading(true);
    try {
      // Dynamically import pdf() to keep it browser-only
      const { pdf } = await import("@react-pdf/renderer");
      const { InvoicePDFTemplate } = await import("./invoice-pdf-template");

      const data: InvoicePDFData = {
        invoiceNo: values.invoiceNo,
        issuedAt: new Date(),
        buyerName: values.buyerName,
        buyerEmail: values.buyerEmail,
        courseTitle: values.courseTitle,
        durationMonths: values.durationMonths,
        amountINR: values.amountINR,
        gst: GST_PERCENT,
      };

      const blob = await pdf(
        InvoicePDFTemplate({ data }),
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${values.invoiceNo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Invoice ${values.invoiceNo} downloaded.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const amount = watchedValues.amountINR || 0;
  const gstAmount = parseFloat(((amount * GST_PERCENT) / 100).toFixed(2));
  const total = amount + gstAmount;

  return (
    <div className="grid h-full gap-6 lg:grid-cols-2">
      {/* ── Left: Form ── */}
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Invoice Details</h2>
          <p className="text-sm text-muted-foreground">
            Fill in the fields — the preview updates live on the right.
          </p>
        </div>

        <form
          id="invoice-form"
          onSubmit={handleSubmit(handleDownload)}
          onChange={syncPreview}
          className="space-y-4"
        >
          {/* Invoice No */}
          <div className="space-y-1.5">
            <Label htmlFor="invoiceNo">Invoice Number</Label>
            <Input
              id="invoiceNo"
              placeholder="DEVIT-2026-00001"
              {...register("invoiceNo")}
              className="font-mono"
            />
            {errors.invoiceNo && (
              <p className="text-xs text-destructive">
                {errors.invoiceNo.message}
              </p>
            )}
          </div>

          {/* Course */}
          <div className="space-y-1.5">
            <Label htmlFor="domainId">Course / Domain</Label>
            <Select onValueChange={handleDomainChange}>
              <SelectTrigger id="domainId">
                <SelectValue placeholder="Select a course…" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                    {!d.isFree && d.priceINR
                      ? ` — ₹${parseFloat(d.priceINR).toLocaleString("en-IN")}`
                      : " — Free"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.domainId && (
              <p className="text-xs text-destructive">
                {errors.domainId.message}
              </p>
            )}
          </div>

          {/* Course Title (editable override) */}
          <div className="space-y-1.5">
            <Label htmlFor="courseTitle">Course Title (shown on invoice)</Label>
            <Input
              id="courseTitle"
              placeholder="e.g. Frontend Development Internship"
              {...register("courseTitle")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Duration */}
            <div className="space-y-1.5">
              <Label htmlFor="durationMonths">Duration (months)</Label>
              <Select
                defaultValue="1"
                onValueChange={(v) => {
                  setValue("durationMonths", Number(v));
                  syncPreview();
                }}
              >
                <SelectTrigger id="durationMonths">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 month</SelectItem>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="amountINR">Amount (₹)</Label>
              <Input
                id="amountINR"
                type="number"
                step="0.01"
                min="0"
                {...register("amountINR")}
              />
              {errors.amountINR && (
                <p className="text-xs text-destructive">
                  {errors.amountINR.message}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Buyer */}
          <div className="space-y-1.5">
            <Label htmlFor="buyerName">Buyer Name</Label>
            <Input
              id="buyerName"
              placeholder="e.g. Venkataramana Hegde"
              {...register("buyerName")}
            />
            {errors.buyerName && (
              <p className="text-xs text-destructive">
                {errors.buyerName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="buyerEmail">Buyer Email</Label>
            <Input
              id="buyerEmail"
              type="email"
              placeholder="buyer@example.com"
              {...register("buyerEmail")}
            />
            {errors.buyerEmail && (
              <p className="text-xs text-destructive">
                {errors.buyerEmail.message}
              </p>
            )}
          </div>
        </form>

        {/* ── Computed totals ── */}
        <Card className="border-0 bg-muted/40 shadow-none ring-1 ring-border">
          <CardContent className="space-y-2 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{amount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">GST ({GST_PERCENT}%)</span>
              <span>₹{gstAmount.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span className="text-lg">₹{total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* ── Actions ── */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            form="invoice-form"
            disabled={downloading}
            className="flex-1 sm:flex-none"
          >
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview((p) => !p)}
            className="lg:hidden"
          >
            {showPreview ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {showPreview ? "Hide" : "Show"} Preview
          </Button>
        </div>
      </div>

      {/* ── Right: Live PDF Preview ── */}
      <div
        className={`${showPreview ? "flex" : "hidden"} lg:flex flex-col gap-2`}
      >
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            Live Preview
          </p>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Updates as you type
          </span>
        </div>
        <div className="min-h-[600px] flex-1 overflow-hidden rounded-xl border bg-muted/20 shadow-inner">
          <InvoicePDFPreviewInner data={previewData} />
        </div>
      </div>
    </div>
  );
}
