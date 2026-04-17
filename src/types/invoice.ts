export type Invoice = {
  id: string;
  invoiceNo: string;
  enrollmentId: string;
  buyerName: string;
  buyerEmail: string;
  courseTitle: string;
  amountINR: string; // Decimal serialized as string
  gstPercent: number;
  gstAmount: string;
  total: string;
  pdfUrl: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  issuedAt: string;
};

export type InvoicePDFData = {
  invoiceNo: string;
  issuedAt: Date | string;
  buyerName: string;
  buyerEmail: string;
  courseTitle: string;
  durationMonths: number;
  amountINR: number;
  gst: number; // percentage e.g. 18
};

export type DomainOption = {
  id: string;
  title: string;
  priceINR: string | null;
  isFree: boolean;
  durationOptions: number[];
};
