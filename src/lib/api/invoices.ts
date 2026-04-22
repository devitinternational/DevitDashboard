import type {
  InvoiceDetail,
  InvoiceHistoryFilters,
  InvoiceListResponse,
  InvoiceMetaResponse,
  ProjectInvoicePayload,
  SendInvoicePayload,
  StudentInvoicePayload,
} from "@/types/invoice";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message ?? data?.error ?? "Request failed");
  }

  return data;
}

export async function fetchInvoiceMeta(studentSearch?: string) {
  const params = new URLSearchParams();
  if (studentSearch?.trim()) params.set("studentSearch", studentSearch.trim());
  return request<InvoiceMetaResponse>(`/api/invoices/meta${params.toString() ? `?${params}` : ""}`);
}

export async function fetchInvoices(filters: InvoiceHistoryFilters) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.domain) params.set("domain", filters.domain);
  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);

  return request<InvoiceListResponse>(`/api/invoices?${params.toString()}`);
}

export async function fetchInvoiceDetail(id: string) {
  return request<{ success: boolean; data: InvoiceDetail }>(`/api/invoices/${id}`);
}

export async function createStudentInvoice(payload: StudentInvoicePayload) {
  return request<{ success: boolean; data: InvoiceDetail }>("/api/invoices/student", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProjectInvoice(payload: ProjectInvoicePayload) {
  return request<{ success: boolean; data: InvoiceDetail }>("/api/invoices/project", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function sendInvoice(id: string, payload: SendInvoicePayload) {
  return request<{
    success: boolean;
    data: {
      mode: "send" | "test";
      preview: { subject: string; text: string };
      invoice: InvoiceDetail;
    };
  }>(`/api/invoices/${id}/send`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchInvoicePdfUrl(id: string) {
  return request<{ success: boolean; data: { url: string } }>(`/api/invoices/${id}/pdf`);
}
