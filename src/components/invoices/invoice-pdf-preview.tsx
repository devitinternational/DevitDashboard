"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { InvoicePDFTemplate } from "./invoice-pdf-template";
import type { InvoicePdfPreviewData } from "@/types/invoice";

interface Props {
  data: InvoicePdfPreviewData;
}

export function InvoicePDFPreviewInner({ data }: Props) {
  return (
    <PDFViewer
      width="100%"
      height="100%"
      showToolbar={false}
      style={{ borderRadius: "0.75rem", border: "none" }}
    >
      <InvoicePDFTemplate data={data} />
    </PDFViewer>
  );
}
