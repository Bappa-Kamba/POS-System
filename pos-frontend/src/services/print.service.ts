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
  logoUrl?: string; // Added field
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
 * Utility functions for handling logo files in receipts
 */

// Global cache for processed logos (shared across the entire app)
const logoCache = new Map<string, string>();

/**
 * Optimize SVG for receipt printing by removing unnecessary attributes
 * and ensuring proper sizing
 * @param svgContent - The SVG content as a string
 * @returns Optimized SVG content
 */
export const optimizeSvgForReceipt = (svgContent: string): string => {
  // Create a temporary DOM element to parse the SVG
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = svgDoc.querySelector('svg');
  
  if (!svgElement) {
    return svgContent;
  }
  
  // Ensure viewBox is set for proper scaling
  if (!svgElement.getAttribute('viewBox')) {
    const width = svgElement.getAttribute('width') || '100';
    const height = svgElement.getAttribute('height') || '100';
    svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }
  
  // Remove fixed width/height to allow flexible sizing
  svgElement.removeAttribute('width');
  svgElement.removeAttribute('height');
  
  // Serialize back to string
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgElement);
};

/**
 * Utility functions for processing logos for receipt printing
 * Handles cropping whitespace and resizing
 */

export interface ImageDimensions {
  width: number;
  height: number;
  croppedDataUrl: string;
}

/**
 * Automatically crop whitespace from an image
 * @param imageUrl - Data URL or regular URL of the image
 * @param padding - Optional padding to keep around the image (in pixels)
 * @returns Promise with cropped image data URL and dimensions
 */
export const cropImageWhitespace = async (
  imageUrl: string,
  padding: number = 10
): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Create canvas with original image size
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Find the bounds of non-white pixels
      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = 0;
      let maxY = 0;

      // Threshold for "white" - adjust if needed (closer to 255 = more strict)
      const whiteThreshold = 250;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          const r = pixels[index];
          const g = pixels[index + 1];
          const b = pixels[index + 2];
          const a = pixels[index + 3];

          // Check if pixel is not white and not transparent
          const isNotWhite = r < whiteThreshold || g < whiteThreshold || b < whiteThreshold;
          const isVisible = a > 10; // Not transparent

          if (isNotWhite && isVisible) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      // If no content found, return original
      if (minX > maxX || minY > maxY) {
        console.warn('No content found in image, returning original');
        resolve({
          width: canvas.width,
          height: canvas.height,
          croppedDataUrl: canvas.toDataURL('image/png')
        });
        return;
      }

      // Add padding
      minX = Math.max(0, minX - padding);
      minY = Math.max(0, minY - padding);
      maxX = Math.min(canvas.width - 1, maxX + padding);
      maxY = Math.min(canvas.height - 1, maxY + padding);

      // Calculate cropped dimensions
      const croppedWidth = maxX - minX + 1;
      const croppedHeight = maxY - minY + 1;

      // Create new canvas with cropped size
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = croppedWidth;
      croppedCanvas.height = croppedHeight;

      const croppedCtx = croppedCanvas.getContext('2d');
      if (!croppedCtx) {
        reject(new Error('Could not get cropped canvas context'));
        return;
      }

      // Draw cropped image
      croppedCtx.drawImage(
        canvas,
        minX,
        minY,
        croppedWidth,
        croppedHeight,
        0,
        0,
        croppedWidth,
        croppedHeight
      );

      // Convert to data URL
      const croppedDataUrl = croppedCanvas.toDataURL('image/png');

      resolve({
        width: croppedWidth,
        height: croppedHeight,
        croppedDataUrl
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

/**
 * Resize image to fit within maximum dimensions while maintaining aspect ratio
 * @param imageUrl - Data URL or regular URL of the image
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @returns Promise with resized image data URL and dimensions
 */
export const resizeImage = async (
  imageUrl: string,
  maxWidth: number,
  maxHeight: number
): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate scaling factor
      const widthScale = maxWidth / width;
      const heightScale = maxHeight / height;
      const scale = Math.min(widthScale, heightScale, 1); // Don't upscale

      width = Math.round(width * scale);
      height = Math.round(height * scale);

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Use better image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to data URL
      const resizedDataUrl = canvas.toDataURL('image/png');

      resolve({
        width,
        height,
        croppedDataUrl: resizedDataUrl
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

/**
 * Crop whitespace AND resize image for receipt printing
 * This is the recommended function to use for processing receipt logos
 * @param imageUrl - Data URL or regular URL of the image
 * @param maxWidthMm - Maximum width in millimeters (default: 50mm for 72mm receipt)
 * @param maxHeightMm - Maximum height in millimeters (default: 20mm)
 * @param dpi - DPI for conversion (default: 203 for thermal printers)
 * @returns Promise with processed image data URL
 */
export const processLogoForReceipt = async (
  imageUrl: string,
  maxWidthMm: number = 50,
  maxHeightMm: number = 20,
  dpi: number = 203
): Promise<string> => {
  try {
    // Convert mm to pixels (at specified DPI)
    const mmToPixels = (mm: number) => Math.round((mm / 25.4) * dpi);
    
    const maxWidthPx = mmToPixels(maxWidthMm);
    const maxHeightPx = mmToPixels(maxHeightMm);

    // Step 1: Crop whitespace
    const cropped = await cropImageWhitespace(imageUrl, 5);

    // Step 2: Resize to fit receipt dimensions
    const resized = await resizeImage(
      cropped.croppedDataUrl,
      maxWidthPx,
      maxHeightPx
    );

    return resized.croppedDataUrl;
  } catch (error) {
    console.error('Failed to process logo for receipt:', error);
    throw error;
  }
};

/**
 * Get image dimensions without loading into DOM
 * @param imageUrl - Data URL or regular URL
 * @returns Promise with width and height
 */
export const getImageDimensions = (imageUrl: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
};

/**
 * Convert mm to pixels for a given DPI
 * @param mm - Size in millimeters
 * @param dpi - Dots per inch (default: 203 for thermal printers)
 * @returns Size in pixels
 */
export const mmToPixels = (mm: number, dpi: number = 203): number => {
  return Math.round((mm / 25.4) * dpi);
};

/**
 * Convert pixels to mm for a given DPI
 * @param pixels - Size in pixels
 * @param dpi - Dots per inch (default: 203 for thermal printers)
 * @returns Size in millimeters
 */
export const pixelsToMm = (pixels: number, dpi: number = 203): number => {
  return (pixels * 25.4) / dpi;
};

/**
 * Load Logo from URL and convert to optimized PNG data URL
 * Uses a global cache to avoid redundant API calls
 * Automatically crops whitespace and sizes for receipt printing
 * @param url - URL of the logo file
 * @returns Promise resolving to processed data URL
 */
export const loadSvgFromUrl = async (url: string): Promise<string> => {
  // Check cache first
  if (logoCache.has(url)) {
    return logoCache.get(url)!;
  }

  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    
    let imageDataUrl: string;
    
    // Check if it's an SVG
    if (contentType?.includes('image/svg+xml') || url.toLowerCase().endsWith('.svg')) {
        const svgText = await response.text();
        const optimized = optimizeSvgForReceipt(svgText);
        
        // Convert SVG to blob URL
        const svgBlob = new Blob([optimized], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        try {
            // Convert SVG to PNG and process (crop + resize)
            const img = new Image();
            img.src = svgUrl;
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });
            
            // Convert to data URL first
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context not found');
            ctx.drawImage(img, 0, 0);
            const pngDataUrl = canvas.toDataURL('image/png');
            
            URL.revokeObjectURL(svgUrl);
            
            // Process the PNG (crop whitespace and resize)
            imageDataUrl = await processLogoForReceipt(pngDataUrl);
        } catch (e) {
            URL.revokeObjectURL(svgUrl);
            throw e;
        }
    } else {
        // Handle non-SVG images (PNG, JPG, etc.)
        const blob = await response.blob();
        const rawDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        // Process the image (crop whitespace and resize)
        imageDataUrl = await processLogoForReceipt(rawDataUrl);
    }
    
    // Store in cache before returning
    logoCache.set(url, imageDataUrl);
    return imageDataUrl;
  } catch (error) {
    console.error('Failed to load and process logo from URL:', error);
    throw error;
  }
};
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
    
    .receipt-logo {
      display: block;
      margin: 0 auto 16px;
      width: 100%;
    }
  </style>
</head>

<body>
  <div class="receipt">

    <!-- HEADER -->
    ${data.logoUrl ? `<img src="${data.logoUrl}" class="receipt-logo" />` : ''}
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
export const printReceipt = async (data: ReceiptData | PrintRequest): Promise<void> => {
  const printWindow = window.open("");
  if (!printWindow) return;

  const receiptData = { ...(data as ReceiptData) };

  // Optimize logo if available to ensure consistent rendering
  if (receiptData.logoUrl) {
    try {
      receiptData.logoUrl = await loadSvgFromUrl(receiptData.logoUrl);
    } catch (e) {
      console.warn('Failed to optimize logo for HTML receipt:', e);
    }
  }

  const html = generateReceiptHTML(receiptData);
  
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

/**
 * Generate receipt PDF
 */
export const generateReceiptPDF = async (data: ReceiptData): Promise<Blob> => {
  const doc = new jsPDF({ format: "a4", unit: "mm" });

  let y = 20;

  // Business Info
  // Render logo if available
  if (data.logoUrl) {
    try {
        const base64 = await loadSvgFromUrl(data.logoUrl);
        
        const imgProps = doc.getImageProperties(base64);
        const ratio = imgProps.height / imgProps.width;
        let w = 40; // Max width assumption
        let h = w * ratio;
        if (h > 18) {
            h = 18;
            w = h / ratio;
        }
        // Assuming 105 is center based on existing code logic
        const x = 105 - (w / 2);
        doc.addImage(base64, 'PNG', x, y, w, h);
        y += h + 5;
        console.log("Logo added to PDF", base64);
    } catch (e) {
        console.warn('Failed to embed logo in PDF', e);
    }
  }

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
