# Receipt Logo Implementation Summary

## Overview
Implemented end-to-end support for uploading, processing, and displaying a receipt logo (80mm width) on receipts (HTML & PDF).

## Backend Changes
1.  **Database Schema (Prisma)**
    *   Added `Asset` model to store logo metadata and paths.
    *   Added `AssetKind` enum (`RECEIPT_LOGO`).
    *   Added `receiptLogoAssetId` to `Branch` and `Subdivision` models.
2.  **Assets Module**
    *   Created `AssetsService` to handle file upload and processing.
    *   Using `sharp` to process images:
        *   Resize to fit 80mm paper (minus padding).
        *   Grayscale, Flatten, Sharpen, Threshold (B&W).
        *   Save original and processed (PNG) files to `data/assets/logos`.
    *   Created `AssetsController` at `/api/v1/assets`.
        *   `POST /receipt-logo`: Uploads and links logo to Branch or Subdivision.
        *   `GET /:id/processed`: Serves the processed logo image.
3.  **Receipt Resolution**
    *   Updated `ReceiptResolutionService` to include `logoAssetId` in resolved config (inheriting from Subdivision -> Branch -> Main Branch).
    *   Updated `SalesService` to include `logoUrl` in the receipt data response.

## Frontend Changes
1.  **Receipt Settings (SettingsPage)**
    *   Created `ReceiptLogoUpload` component.
    *   Allows uploading logo for Branch settings.
    *   Allows uploading logo for Subdivision overrides.
    *   Displays preview of the processed logo.
2.  **Receipt Printing**
    *   Updated `ReceiptData` type to include `logoUrl`.
    *   Updated `generateReceiptHTML` (`print.service.ts`) to include the logo `<img>` tag.
    *   Updated `generateReceiptPDF` (`print.service.ts`) to fetch the logo image and embed it into the PDF using `jspdf`.
    *   Updated CSS to ensure logo fits within receipt width (max height 18mm).

## Verification
*   **Build**: Backend and Frontend builds passed.
*   **Lint**: Fixed lint errors in new files.

## Next Steps
*   Ensure `data` directory permissions allow writing in production.
*   Environment variables `RECEIPT_PAPER_MM`, `RECEIPT_DPI`, `RECEIPT_LOGO_THRESHOLD` can be tuned in `.env` if needed.
