import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatCurrency, formatDate } from "../utils/formatters";
import type { PrintOrderData, ResolvedReceiptConfig } from '../types/receipt';

export interface PrintRequest {
  order: PrintOrderData;
  receiptConfig: ResolvedReceiptConfig;
  printerProfile?: any;
}

export interface ReceiptData {
  business: {
    name: string;
    address: string;
    phone: string;
  };
  branch: string;
  receiptNumber: string;
  transactionType: 'PURCHASE' | 'CASHBACK';
  date: string;
  cashier: string;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    subtotal: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payments: Array<{
    method: "CASH" | "CARD" | "TRANSFER";
    amount: number;
    reference?: string;
  }>;
  change: number;
  footer: string;
  currency: string;
}

/**
 * Generate receipt HTML for printing
 */
export const generateReceiptHTML = (data: ReceiptData): string => {
  console.log(data);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Receipt</title>
  <style>
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      -webkit-font-smoothing: none;
      image-rendering: crisp-edges;
    }

    @page {
      size: 72mm auto;
      margin: 0;
    }

    body {
      margin: 0;
      padding: 0;
      background: white;
      color: black;
      font-family: monospace;
      font-size: 12px;
      line-height: 1.15;
    }

    .receipt {
      width: 72mm;
      margin: 0 auto;
    }

    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .large { font-size: 16px; }

    .divider {
      border-top: 1px dashed #000;
      margin: 8px 0;
    }

    .meta {
      display: grid;
      grid-template-columns: 1fr auto;
      row-gap: 2px;
      margin-top: 6px;
    }

    .badge {
      display: inline-block;
      padding: 3px 10px;
      font-size: 11px;
      font-weight: bold;
      border-radius: 12px;
      margin: 6px auto;
    }

    .items {
      margin-top: 4px;
    }

    .item {
      margin-bottom: 4px;
    }

    .item-name {
      font-weight: bold;
      margin-bottom: 1px;
    }

    .item-row {
      display: grid;
      grid-template-columns: 10mm 32mm 20mm;
      font-size: 11px;
    }

    .totals {
      display: grid;
      grid-template-columns: 1fr auto;
      row-gap: 2px;
      margin-top: 4px;
    }

    .payments {
      display: grid;
      grid-template-columns: 1fr auto;
      row-gap: 2px;
      margin-top: 4px;
    }

    .footer {
      margin-top: 6px;
      text-align: center;
      font-size: 10px;
    }

    .no-print {
      display: none;
    }
  </style>
</head>

<body>
  <div class="receipt">

    <!-- HEADER -->
    <div class="center bold large">${data.business.name}</div>
    <div class="center">${data.business.address}</div>
    <div class="center">${data.business.phone}</div>

    ${
      data.branch !== data.business.name ? `<div class="center">A subsidiary of ${data.branch}</div>` : ""
    }

    <div class="divider"></div>

    <div class="center">
      <span class="badge">
        ${data.transactionType}
      </span>
    </div>

    <!-- META -->
    <div class="meta">
      <div>Receipt #:</div>
      <div class="right bold">${data.receiptNumber}</div>

      <div>Date:</div>
      <div class="right">${formatDate(data.date, "datetime")}</div>

      <div>Cashier:</div>
      <div class="right">${data.cashier}</div>
    </div>

    <div class="divider"></div>

    <!-- ITEMS -->
    <div class="items">
      ${data.items
        .map(
          (item) => `
        <div class="item">
          <div class="item-name">${item.name}</div>
          <div class="item-row">
            <div>${item.quantity}×</div>
            <div class="right">@ ${formatCurrency(
              item.unitPrice,
              data.currency
            )}</div>
            <div class="right bold">${formatCurrency(
              item.total,
              data.currency
            )}</div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>

    <div class="divider"></div>

    <!-- TOTALS -->
    <div class="totals">
      <div>Subtotal:</div>
      <div class="right">${formatCurrency(
        data.subtotal,
        data.currency
      )}</div>

      ${
        data.tax > 0
          ? `<div>Tax:</div>
             <div class="right">${formatCurrency(
               data.tax,
               data.currency
             )}</div>`
          : ""
      }

      ${
        data.discount > 0
          ? `<div>Discount:</div>
             <div class="right">-${formatCurrency(
               data.discount,
               data.currency
             )}</div>`
          : ""
      }

      <div class="bold large">TOTAL:</div>
      <div class="right bold large">${formatCurrency(
        data.total,
        data.currency
      )}</div>
    </div>

    <div class="divider"></div>

    <!-- PAYMENTS -->
    <div class="payments">
      ${data.payments
        .map(
          (p) => `
        <div>${p.method}:</div>
        <div class="right">${formatCurrency(
          p.amount,
          data.currency
        )}</div>
      `
        )
        .join("")}

      ${
        data.change > 0
          ? `<div class="bold">Change:</div>
             <div class="right bold">${formatCurrency(
               data.change,
               data.currency
             )}</div>`
          : ""
      }
    </div>

    <div class="divider"></div>

    <div class="footer">${data.footer}</div>

  </div>

  <br>
  <button class="no-print" onclick="window.print()">Print</button>
</body>
</html>
`;
};

/**
 * Print receipt using browser print dialog
 */
/**
 * Print receipt using browser print dialog
 * Supports legacy ReceiptData or new PrintRequest
 */
export const printReceipt = (data: ReceiptData | PrintRequest): void => {
  const html = generateReceiptHTML(data as ReceiptData);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

/**
 * Generate receipt PDF
 */
export const generateReceiptPDF = async (data: ReceiptData): Promise<Blob> => {
  const doc = new jsPDF({ format: "a5", unit: "mm" });

  let y = 20;

  // Business Info
  doc.setFontSize(16);
  doc.text(data.business.name, 105, y, { align: "center" });

  y += 8;
  doc.setFontSize(10);
  doc.text(data.business.address, 105, y, { align: "center" });

  y += 5;
  doc.text(data.business.phone, 105, y, { align: "center" });

  y += 5;
  doc.text(data.branch, 105, y, { align: "center" });

  y += 10;
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);

  y += 8;
  // Transaction Type Badge
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const transactionTypeText = data.transactionType === 'CASHBACK' ? 'CASHBACK' : 'PURCHASE';
  const transactionTypeColor = data.transactionType === 'CASHBACK' ? [254, 215, 170] : [187, 247, 208];
  doc.setFillColor(transactionTypeColor[0], transactionTypeColor[1], transactionTypeColor[2]);
  doc.roundedRect(75, y - 3, 60, 6, 3, 3, 'FD');
  doc.setTextColor(data.transactionType === 'CASHBACK' ? 154 : 22);
  doc.text(transactionTypeText, 105, y, { align: "center" });
  doc.setTextColor(0, 0, 0); // Reset to black

  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Receipt #: ${data.receiptNumber}`, 20, y);
  y += 5;
  doc.text(`Date: ${formatDate(data.date, "datetime")}`, 20, y);
  y += 5;
  doc.text(`Cashier: ${data.cashier}`, 20, y);

  y += 8;
  doc.line(20, y, 190, y);

  // Items Table
  y += 5;
  const tableData = data.items.map((item) => [
    item.name,
    `${item.quantity} x ${formatCurrency(item.unitPrice, data.currency)}`,
    formatCurrency(item.total, data.currency),
  ]);

  (doc as any).autoTable({
    startY: y,
    head: [["Item", "Quantity", "Total"]],
    body: tableData,
    theme: "plain",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [240, 240, 240] },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 60, halign: "center" },
      2: { cellWidth: 50, halign: "right" },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Totals
  doc.line(20, y, 190, y);
  y += 8;

  doc.setFontSize(10);
  doc.text("Subtotal:", 150, y, { align: "right" });
  doc.text(formatCurrency(data.subtotal, data.currency), 190, y, {
    align: "right",
  });

  if (data.tax > 0) {
    y += 5;
    doc.text("Tax:", 150, y, { align: "right" });
    doc.text(formatCurrency(data.tax, data.currency), 190, y, {
      align: "right",
    });
  }

  if (data.discount > 0) {
    y += 5;
    doc.text("Discount:", 150, y, { align: "right" });
    doc.text(`-${formatCurrency(data.discount, data.currency)}`, 190, y, {
      align: "right",
    });
  }

  y += 5;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", 150, y, { align: "right" });
  doc.text(formatCurrency(data.total, data.currency), 190, y, {
    align: "right",
  });

  y += 10;
  doc.line(20, y, 190, y);
  y += 8;

  // Payments
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  data.payments.forEach((payment) => {
    doc.text(`${payment.method}:`, 150, y, { align: "right" });
    doc.text(formatCurrency(payment.amount, data.currency), 190, y, {
      align: "right",
    });
    y += 5;
  });

  if (data.change > 0) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.text("Change:", 150, y, { align: "right" });
    doc.text(formatCurrency(data.change, data.currency), 190, y, {
      align: "right",
    });
  }

  y += 10;
  doc.line(20, y, 190, y);
  y += 8;

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(data.footer, 105, y, { align: "center" });

  return doc.output("blob");
};

/**
 * Download receipt as PDF
 */
export const downloadReceiptPDF = async (
  data: ReceiptData,
  filename?: string
): Promise<void> => {
  const blob = await generateReceiptPDF(data);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `receipt-${data.receiptNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
