import React from "react";
import {
  Document,
  type DocumentProps,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { InvoicePDFData } from "@/types/invoice";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  brand: { fontSize: 24, fontWeight: "bold", color: "#0f172a" },
  brandSub: { fontSize: 10, color: "#64748b", marginTop: 4 },
  invoiceTitle: { fontSize: 32, color: "#e2e8f0", fontWeight: "bold" },
  divider: { borderBottom: "1px solid #e2e8f0", marginVertical: 16 },
  label: {
    fontSize: 9,
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: { fontSize: 11, color: "#0f172a" },
  valueBlue: { fontSize: 11, color: "#3b82f6" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    padding: "8 12",
    borderRadius: 4,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 9,
    color: "#64748b",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "10 12",
    borderBottom: "1px solid #f1f5f9",
  },
  tableCell: { fontSize: 11, color: "#0f172a" },
  tableCellBlue: { fontSize: 11, color: "#3b82f6", fontWeight: "bold" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "12 12",
    backgroundColor: "#0f172a",
    borderRadius: 4,
    marginTop: 8,
  },
  totalText: { fontSize: 12, color: "#ffffff", fontWeight: "bold" },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48 },
  footerText: { fontSize: 9, color: "#94a3b8", textAlign: "center" },
});

export function InvoicePDFTemplate({
  data,
}: {
  data: InvoicePDFData;
}): React.ReactElement<DocumentProps> {
  const subtotal = data.amountINR;
  const gstAmount = parseFloat(((subtotal * data.gst) / 100).toFixed(2));
  const total = subtotal + gstAmount;
  const date = new Date(data.issuedAt);

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },

      // ── Header ──
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.brand }, "DevIt"),
          React.createElement(
            Text,
            { style: styles.brandSub },
            "devit.in · hello@devit.in",
          ),
        ),
        React.createElement(Text, { style: styles.invoiceTitle }, "INVOICE"),
      ),

      // ── Divider ──
      React.createElement(View, { style: styles.divider }),

      // ── Meta: Invoice No / Date  |  Billed To ──
      React.createElement(
        View,
        {
          style: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 16,
            marginBottom: 32,
          },
        },
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.label }, "Invoice No"),
          React.createElement(Text, { style: styles.valueBlue }, data.invoiceNo),
          React.createElement(
            Text,
            { style: { ...styles.label, marginTop: 12 } },
            "Date",
          ),
          React.createElement(
            Text,
            { style: styles.value },
            date.toLocaleDateString("en-IN"),
          ),
        ),
        React.createElement(
          View,
          { style: { alignItems: "flex-end" } },
          React.createElement(Text, { style: styles.label }, "Billed To"),
          React.createElement(Text, { style: styles.value }, data.buyerName),
          React.createElement(
            Text,
            { style: { ...styles.value, color: "#64748b" } },
            data.buyerEmail,
          ),
        ),
      ),

      // ── Table Header ──
      React.createElement(
        View,
        { style: styles.tableHeader },
        React.createElement(
          Text,
          { style: styles.tableHeaderText },
          "Description",
        ),
        React.createElement(
          Text,
          { style: styles.tableHeaderText },
          "Duration",
        ),
        React.createElement(Text, { style: styles.tableHeaderText }, "Amount"),
      ),

      // ── Table Row ──
      React.createElement(
        View,
        { style: styles.tableRow },
        React.createElement(
          Text,
          { style: styles.tableCellBlue },
          data.courseTitle,
        ),
        React.createElement(
          Text,
          { style: { ...styles.tableCell, color: "#3b82f6" } },
          `${data.durationMonths} month${data.durationMonths > 1 ? "s" : ""}`,
        ),
        React.createElement(
          Text,
          { style: styles.tableCell },
          `₹${subtotal.toFixed(2)}`,
        ),
      ),

      // ── Totals ──
      React.createElement(
        View,
        { style: { alignItems: "flex-end", marginTop: 16 } },
        React.createElement(
          View,
          { style: { width: 240 } },
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(
              Text,
              { style: { fontSize: 10, color: "#64748b" } },
              "Subtotal",
            ),
            React.createElement(
              Text,
              { style: { fontSize: 10 } },
              `₹${subtotal.toFixed(2)}`,
            ),
          ),
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(
              Text,
              { style: { fontSize: 10, color: "#64748b" } },
              `GST (${data.gst}%)`,
            ),
            React.createElement(
              Text,
              { style: { fontSize: 10 } },
              `₹${gstAmount.toFixed(2)}`,
            ),
          ),
          React.createElement(
            View,
            { style: styles.totalRow },
            React.createElement(Text, { style: styles.totalText }, "Total"),
            React.createElement(
              Text,
              { style: styles.totalText },
              `₹${total.toFixed(2)}`,
            ),
          ),
        ),
      ),

      // ── Footer ──
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(
          Text,
          { style: styles.footerText },
          "Thank you for learning with DevIt. This is a computer-generated invoice.",
        ),
      ),
    ),
  );
}
