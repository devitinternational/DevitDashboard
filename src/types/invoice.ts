export type InvoiceStatus = "draft" | "sent" | "paid" | "failed";
export type InvoiceType = "student" | "project";

export type InvoiceListItem = {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  name: string;
  email: string;
  amount: number;
  status: InvoiceStatus;
  domain: string | null;
  createdAt: string;
  issuedAt: string;
  projectName: string | null;
  courseName: string;
};

export type InvoiceItem = {
  id?: string;
  name: string;
  description?: string | null;
  quantity: number;
  price: number;
  total?: number;
};

export type InvoiceDetail = {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  name: string;
  email: string;
  courseName: string;
  projectName: string | null;
  domain: string | null;
  amount: number;
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  invoiceDate: string;
  dueDate: string | null;
  notes: string | null;
  emailTemplate: string;
  emailSubject: string | null;
  recipients: string[];
  pdfUrl: string | null;
  sentAt: string | null;
  paidAt: string | null;
  failedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  enrollmentId: string | null;
  itemLabel: string;
  items: InvoiceItem[];
};

export type InvoiceListResponse = {
  data: InvoiceListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

export type DomainOption = {
  id: string;
  title: string;
  slug: string;
};

export type StudentInvoiceSource = {
  enrollmentId: string;
  name: string;
  email: string;
  courseName: string;
  domain: string;
  amount: number;
  durationMonths: number;
  paymentRef: string | null;
  existingInvoice: {
    id: string;
    invoiceNumber: string;
    status: InvoiceStatus;
    sentAt: string | null;
  } | null;
};

export type InvoiceMetaResponse = {
  success: boolean;
  data: {
    domains: DomainOption[];
    studentSources: StudentInvoiceSource[];
    placeholders: string[];
    defaultEmailTemplate: string;
  };
};

export type InvoiceHistoryFilters = {
  search: string;
  startDate?: string;
  endDate?: string;
  domain: string;
  type: "" | InvoiceType;
  status: "" | InvoiceStatus;
  page: number;
  limit: number;
  sortBy:
    | "createdAt"
    | "invoiceNumber"
    | "amount"
    | "status"
    | "name"
    | "domain";
  sortOrder: "asc" | "desc";
};

export type StudentInvoicePayload = {
  enrollmentId: string;
  name: string;
  email: string;
  courseName: string;
  amount: number;
  invoiceDate: string;
  notes?: string;
  emailTemplate?: string;
  subject?: string;
  recipients?: string[];
  status?: "draft" | "paid";
};

export type ProjectInvoicePayload = {
  invoiceId?: string;
  clientName: string;
  clientEmail: string;
  projectName: string;
  domain: string;
  items: InvoiceItem[];
  invoiceDate: string;
  dueDate?: string;
  notes?: string;
  emailTemplate?: string;
  subject?: string;
  recipients?: string[];
  status?: "draft" | "sent" | "paid";
};

export type SendInvoicePayload = {
  emails?: string[];
  subject?: string;
  emailTemplate?: string;
  mode?: "send" | "test";
};

export type InvoicePdfPreviewData = {
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate?: string;
  buyerName: string;
  buyerEmail: string;
  courseName: string;
  projectName?: string;
  domain?: string;
  subtotal: number;
  gstPercent?: number;
  gstAmount?: number;
  total: number;
  items: InvoiceItem[];
  notes?: string;
};
