import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatCurrency, formatDate } from "../utils/formatters";

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
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          max-width: 300px;
          margin: 0 auto;
          padding: 10px;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .large { font-size: 14px; }
        .divider {
          border-top: 1px dashed #000;
          margin: 10px 0;
        }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; }
        .right { text-align: right; }
        .item-row td:first-child { width: 60%; }
        .item-row td:last-child { text-align: right; }
        @media print {
          body { margin: 0; padding: 5mm; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="center bold large">${data.business.name}</div>
      <div class="center">${data.business.address}</div>
      <div class="center">${data.business.phone}</div>
      <div class="center">${data.branch}</div>
      
      <div class="divider"></div>
      
      <div class="center" style="margin: 8px 0;">
        <span style="padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 11px; ${
          data.transactionType === 'CASHBACK'
            ? 'background-color: #fed7aa; color: #9a3412;'
            : 'background-color: #bbf7d0; color: #166534;'
        }">
          ${data.transactionType === 'CASHBACK' ? 'CASHBACK' : 'PURCHASE'}
        </span>
      </div>
      
      <table>
        <tr>
          <td>Receipt #:</td>
          <td class="right bold">${data.receiptNumber}</td>
        </tr>
        <tr>
          <td>Date:</td>
          <td class="right">${formatDate(data.date, "datetime")}</td>
        </tr>
        <tr>
          <td>Cashier:</td>
          <td class="right">${data.cashier}</td>
        </tr>
      </table>
      
      <div class="divider"></div>
      
      <table>
        ${data.items
          .map(
            (item) => `
          <tr class="item-row">
            <td colspan="2" style="text-align: left;">${item.name}</td>
          </tr>
          <tr class="item-row">
            <td>${item.quantity} x ${formatCurrency(
              item.unitPrice,
              data.currency
            )}</td>
            <td class="right">${formatCurrency(item.total, data.currency)}</td>
          </tr>
        `
          )
          .join("")}
      </table>
      
      <div class="divider"></div>
      
      <table>
        <tr>
          <td>Subtotal:</td>
          <td class="right">${formatCurrency(data.subtotal, data.currency)}</td>
        </tr>
        ${
          data.tax > 0
            ? `
        <tr>
          <td>Tax:</td>
          <td class="right">${formatCurrency(data.tax, data.currency)}</td>
        </tr>
        `
            : ""
        }
        ${
          data.discount > 0
            ? `
        <tr>
          <td>Discount:</td>
          <td class="right">-${formatCurrency(
            data.discount,
            data.currency
          )}</td>
        </tr>
        `
            : ""
        }
        <tr class="bold large">
          <td>TOTAL:</td>
          <td class="right">${formatCurrency(data.total, data.currency)}</td>
        </tr>
      </table>
      
      <div class="divider"></div>
      
      <table>
        ${data.payments
          .map(
            (p) => `
          <tr>
            <td>${p.method}:</td>
            <td class="right">${formatCurrency(p.amount, data.currency)}</td>
          </tr>
        `
          )
          .join("")}
        ${
          data.change > 0
            ? `
          <tr>
            <td>Change:</td>
            <td class="right">${formatCurrency(data.change, data.currency)}</td>
          </tr>
        `
            : ""
        }
      </table>
      
      <div class="divider"></div>
      
      <div class="center">${data.footer}</div>
      
      <br>
      <button class="no-print" onclick="window.print()">Print</button>
    </body>
    </html>
  `;
};

/**
 * Print receipt using browser print dialog
 */
export const printReceipt = (data: ReceiptData): void => {
  const html = generateReceiptHTML(data);
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
