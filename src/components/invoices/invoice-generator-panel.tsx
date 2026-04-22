"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  MailCheck,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createProjectInvoice,
  createStudentInvoice,
  sendInvoice,
} from "@/lib/api/invoices";
import type {
  DomainOption,
  InvoiceDetail,
  InvoiceItem,
  InvoicePdfPreviewData,
  StudentInvoiceSource,
} from "@/types/invoice";

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

type Props = {
  domains: DomainOption[];
  studentSources: StudentInvoiceSource[];
  defaultEmailTemplate: string;
  onInvoiceSaved?: (invoice: InvoiceDetail) => void;
};

type InvoiceFlow = "student" | "project";

const today = new Date().toISOString().slice(0, 10);

function renderTemplate(template: string, variables: Record<string, string>) {
  return template.replace(/\{\{(name|amount|invoice_id|date|item)\}\}/g, (_match, key) => {
    return variables[key] ?? "";
  });
}

export function InvoiceGeneratorPanel({
  domains,
  studentSources,
  defaultEmailTemplate,
  onInvoiceSaved,
}: Props) {
  const [flow, setFlow] = useState<InvoiceFlow>("student");
  const [showPreview, setShowPreview] = useState(true);
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [busyAction, setBusyAction] = useState<"save" | "test" | "send" | null>(null);
  const [savedInvoice, setSavedInvoice] = useState<InvoiceDetail | null>(null);

  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(
    studentSources[0]?.enrollmentId ?? "",
  );
  const selectedStudent = studentSources.find(
    (item) => item.enrollmentId === selectedEnrollmentId,
  );

  const [studentName, setStudentName] = useState(selectedStudent?.name ?? "");
  const [studentEmail, setStudentEmail] = useState(selectedStudent?.email ?? "");
  const [courseName, setCourseName] = useState(selectedStudent?.courseName ?? "");
  const [studentAmount, setStudentAmount] = useState(String(selectedStudent?.amount ?? 0));
  const [studentInvoiceDate, setStudentInvoiceDate] = useState(today);
  const [studentNotes, setStudentNotes] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [domain, setDomain] = useState(domains[0]?.title ?? "");
  const [projectInvoiceDate, setProjectInvoiceDate] = useState(today);
  const [dueDate, setDueDate] = useState("");
  const [projectNotes, setProjectNotes] = useState("");
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    { name: "Project work", description: "", quantity: 1, price: 0 },
  ]);

  const [recipientInput, setRecipientInput] = useState("");
  const [subject, setSubject] = useState("");
  const [emailTemplate, setEmailTemplate] = useState(defaultEmailTemplate);

  const recipients = useMemo(
    () =>
      recipientInput
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    [recipientInput],
  );

  const projectTotals = useMemo(
    () =>
      lineItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0),
    [lineItems],
  );

  const previewData: InvoicePdfPreviewData = useMemo(() => {
    if (flow === "student") {
      const amount = Number(studentAmount || 0);
      return {
        invoiceNumber: savedInvoice?.invoiceNumber || `DEVIT-${new Date().getFullYear()}-DRAFT`,
        type: "student",
        status: savedInvoice?.status || "paid",
        issuedAt: studentInvoiceDate,
        buyerName: studentName || "Student Name",
        buyerEmail: studentEmail || "student@example.com",
        courseName: courseName || "Course Name",
        domain: selectedStudent?.domain || courseName || undefined,
        subtotal: amount,
        gstAmount: 0,
        gstPercent: 0,
        total: amount,
        items: [
          {
            name: courseName || "Course Name",
            description: "Course enrollment",
            quantity: 1,
            price: amount,
          },
        ],
        notes: studentNotes || undefined,
      };
    }

    return {
      invoiceNumber: savedInvoice?.invoiceNumber || `DEVIT-${new Date().getFullYear()}-DRAFT`,
      type: "project",
      status: savedInvoice?.status || "draft",
      issuedAt: projectInvoiceDate,
      dueDate: dueDate || undefined,
      buyerName: clientName || "Client Name",
      buyerEmail: clientEmail || "client@example.com",
      courseName: projectName || "Project Name",
      projectName: projectName || "Project Name",
      domain: domain || undefined,
      subtotal: projectTotals,
      gstAmount: 0,
      gstPercent: 0,
      total: projectTotals,
      items: lineItems,
      notes: projectNotes || undefined,
    };
  }, [
    courseName,
    dueDate,
    clientEmail,
    clientName,
    domain,
    flow,
    lineItems,
    projectInvoiceDate,
    projectName,
    projectNotes,
    projectTotals,
    savedInvoice,
    selectedStudent,
    studentAmount,
    studentEmail,
    studentInvoiceDate,
    studentName,
    studentNotes,
  ]);

  const emailPreview = useMemo(() => {
    const item = flow === "student" ? courseName || "Course Name" : projectName || "Project Name";
    const name = flow === "student" ? studentName || "Customer" : clientName || "Customer";
    const amount = flow === "student" ? Number(studentAmount || 0) : projectTotals;
    const invoiceId = savedInvoice?.invoiceNumber || previewData.invoiceNumber;
    const date = new Date(
      flow === "student" ? studentInvoiceDate : projectInvoiceDate,
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return renderTemplate(emailTemplate, {
      name,
      amount: amount.toFixed(2),
      invoice_id: invoiceId,
      date,
      item,
    });
  }, [
    clientName,
    courseName,
    emailTemplate,
    flow,
    previewData.invoiceNumber,
    projectInvoiceDate,
    projectName,
    projectTotals,
    savedInvoice,
    studentAmount,
    studentInvoiceDate,
    studentName,
  ]);

  function handleStudentSelection(enrollmentId: string) {
    setSelectedEnrollmentId(enrollmentId);
    const source = studentSources.find((item) => item.enrollmentId === enrollmentId);
    if (!source) return;
    setStudentName(source.name);
    setStudentEmail(source.email);
    setCourseName(source.courseName);
    setStudentAmount(String(source.amount));
    setRecipientInput(source.email);
    setSavedInvoice(null);
  }

  function updateLineItem(index: number, patch: Partial<InvoiceItem>) {
    setLineItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  }

  function addLineItem() {
    setLineItems((current) => [
      ...current,
      { name: "", description: "", quantity: 1, price: 0 },
    ]);
  }

  function removeLineItem(index: number) {
    setLineItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function persistInvoice(mode: "draft" | "active") {
    if (flow === "student") {
      if (!selectedEnrollmentId) {
        throw new Error("Select a paid enrollment first");
      }

      const response = await createStudentInvoice({
        enrollmentId: selectedEnrollmentId,
        name: studentName,
        email: studentEmail,
        courseName,
        amount: Number(studentAmount || 0),
        invoiceDate: studentInvoiceDate,
        notes: studentNotes || undefined,
        emailTemplate,
        subject: subject || undefined,
        recipients,
        status: mode === "draft" ? "draft" : "paid",
      });
      return response.data;
    }

    const response = await createProjectInvoice({
      invoiceId: flow === "project" ? savedInvoice?.id : undefined,
      clientName,
      clientEmail,
      projectName,
      domain,
      items: lineItems,
      invoiceDate: projectInvoiceDate,
      dueDate: dueDate || undefined,
      notes: projectNotes || undefined,
      emailTemplate,
      subject: subject || undefined,
      recipients,
      status: mode === "draft" ? "draft" : undefined,
    });
    return response.data;
  }

  async function handleSaveDraft() {
    try {
      setBusyAction("save");
      const invoice = await persistInvoice("draft");
      setSavedInvoice(invoice);
      onInvoiceSaved?.(invoice);
      toast.success(`Draft ${invoice.invoiceNumber} saved.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save draft");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSend(mode: "test" | "send") {
    try {
      setBusyAction(mode);
      const invoice = await persistInvoice("active");
      setSavedInvoice(invoice);

      const sendResponse = await sendInvoice(invoice.id, {
        emails: recipients.length ? recipients : [flow === "student" ? studentEmail : clientEmail],
        subject: subject || undefined,
        emailTemplate,
        mode,
      });

      setSavedInvoice(sendResponse.data.invoice);
      onInvoiceSaved?.(sendResponse.data.invoice);
      toast.success(
        mode === "test"
          ? `Test email sent for ${sendResponse.data.invoice.invoiceNumber}.`
          : `Invoice ${sendResponse.data.invoice.invoiceNumber} sent.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invoice");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 rounded-2xl bg-muted p-1 shadow-inner w-fit">
          <button
            type="button"
            onClick={() => setFlow("student")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              flow === "student"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Student Invoice
          </button>
          <button
            type="button"
            onClick={() => setFlow("project")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              flow === "project"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Project Invoice
          </button>
        </div>

        {flow === "student" ? (
          <Card className="border-0 shadow-sm ring-1 ring-border">
            <CardContent className="space-y-4 p-5">
              <div>
                <h3 className="text-base font-semibold">Student invoice flow</h3>
                <p className="text-sm text-muted-foreground">
                  Pulls from paid enrollment data so you can quickly resend or recover missed invoices.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>Paid enrollment</Label>
                <Select value={selectedEnrollmentId} onValueChange={handleStudentSelection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a paid enrollment" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentSources.map((source) => (
                      <SelectItem key={source.enrollmentId} value={source.enrollmentId}>
                        {source.name} - {source.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Student Name">
                  <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                </Field>
                <Field label="Email">
                  <Input value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
                </Field>
                <Field label="Course Name">
                  <Input value={courseName} onChange={(e) => setCourseName(e.target.value)} />
                </Field>
                <Field label="Amount">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={studentAmount}
                    onChange={(e) => setStudentAmount(e.target.value)}
                  />
                </Field>
                <Field label="Invoice Date">
                  <Input
                    type="date"
                    value={studentInvoiceDate}
                    onChange={(e) => setStudentInvoiceDate(e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Notes">
                <Textarea
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  placeholder="Optional billing note"
                />
              </Field>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm ring-1 ring-border">
            <CardContent className="space-y-4 p-5">
              <div>
                <h3 className="text-base font-semibold">Project invoice flow</h3>
                <p className="text-sm text-muted-foreground">
                  Fully manual billing for project and service work with dynamic line items.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Client Name">
                  <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
                </Field>
                <Field label="Client Email">
                  <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                </Field>
                <Field label="Project Name">
                  <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                </Field>
                <Field label="Domain">
                  <Select value={domain} onValueChange={setDomain}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((option) => (
                        <SelectItem key={option.id} value={option.title}>
                          {option.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Invoice Date">
                  <Input
                    type="date"
                    value={projectInvoiceDate}
                    onChange={(e) => setProjectInvoiceDate(e.target.value)}
                  />
                </Field>
                <Field label="Due Date">
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </Field>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Line Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                    <Plus className="mr-2 size-4" />
                    Add Item
                  </Button>
                </div>
                {lineItems.map((item, index) => (
                  <div key={`item-${index}`} className="rounded-2xl border p-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <Field label="Item Name">
                        <Input
                          value={item.name}
                          onChange={(e) => updateLineItem(index, { name: e.target.value })}
                        />
                      </Field>
                      <Field label="Description">
                        <Input
                          value={item.description ?? ""}
                          onChange={(e) =>
                            updateLineItem(index, { description: e.target.value })
                          }
                        />
                      </Field>
                      <Field label="Quantity">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(index, { quantity: Number(e.target.value) })
                          }
                        />
                      </Field>
                      <Field label="Price">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) =>
                            updateLineItem(index, { price: Number(e.target.value) })
                          }
                        />
                      </Field>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Line total: Rs. {(item.quantity * item.price).toFixed(2)}
                      </p>
                      {lineItems.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <Field label="Notes">
                <Textarea
                  value={projectNotes}
                  onChange={(e) => setProjectNotes(e.target.value)}
                  placeholder="Optional notes, payment instructions, or scope reminders"
                />
              </Field>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-sm ring-1 ring-border">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Email delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Edit the message only when needed. Placeholders stay supported.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowEmailEditor((current) => !current)}
              >
                {showEmailEditor ? <EyeOff className="mr-2 size-4" /> : <Eye className="mr-2 size-4" />}
                {showEmailEditor ? "Lock template" : "Edit template"}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Recipients">
                <Input
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  placeholder="alice@example.com, finance@example.com"
                />
              </Field>
              <Field label="Subject">
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Optional custom subject"
                />
              </Field>
            </div>

            {showEmailEditor ? (
              <Field label="Email Template">
                <Textarea
                  rows={9}
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                />
              </Field>
            ) : null}

            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Email Preview
              </p>
              <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
                {emailPreview}
              </pre>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={busyAction !== null}
              >
                {busyAction === "save" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                Save Draft
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSend("test")}
                disabled={busyAction !== null}
              >
                {busyAction === "test" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <MailCheck className="mr-2 size-4" />
                )}
                Send Test Email
              </Button>
              <Button type="button" onClick={() => handleSend("send")} disabled={busyAction !== null}>
                {busyAction === "send" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 size-4" />
                )}
                Send Invoice
              </Button>
            </div>

            {savedInvoice ? (
              <div className="rounded-2xl border bg-muted/30 p-4 text-sm">
                Last saved invoice: <span className="font-semibold">{savedInvoice.invoiceNumber}</span>
                <span className="ml-2 capitalize text-muted-foreground">
                  {savedInvoice.status}
                </span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className={`${showPreview ? "flex" : "hidden"} xl:flex flex-col gap-3`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Shared invoice layout</p>
            <p className="text-xs text-muted-foreground">
              Preview matches the backend-generated invoice style.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="xl:hidden"
            onClick={() => setShowPreview((current) => !current)}
          >
            {showPreview ? "Hide" : "Show"} Preview
          </Button>
        </div>
        <div className="min-h-[720px] overflow-hidden rounded-2xl border bg-muted/20 shadow-inner">
          <InvoicePDFPreviewInner data={previewData} />
        </div>
      </div>
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
