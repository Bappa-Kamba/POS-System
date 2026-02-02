# Task: Add Receipt Logo Upload + One-Time Processing (80mm) + Safe Rendering in HTML & PDF

You are a senior full-stack engineer working on a LAN POS system with:
- **Backend:** NestJS + Prisma + SQLite
- **Frontend:** React (TypeScript)
- **Receipts:** rendered as **HTML for printing** and also generated as **PDF**
- Receipt layout has strict width constraints (must not overflow).

The POS needs **a logo on receipts**, configurable per receipt settings (branch/subdivision depending on current code). The user will provide an **SVG logo file**.

## Goals (must meet all)
1. Accept an uploaded logo (SVG; also support PNG/JPEG).
2. Store assets on disk (NOT in SQLite as blobs).
3. On upload, **process exactly one optimized logo file** for thermal printing and receipts (no multiple variants for now).
4. Processing target is **80mm receipt width**, configurable via env var.
5. Render the processed logo in **both**:
   - HTML receipt (printable)
   - PDF receipt
6. Ensure the logo NEVER breaks receipt boundaries (width/height caps).
7. Avoid runtime image processing during checkout/printing. Processing happens at upload time.

---

## Non-negotiable constraints
- Do **not** store raw image data in the DB. Store only metadata and file paths/IDs.
- Do **not** create variants (58mm/80mm). Exactly one derived processed file for now.
- Do **not** change receipt width styling beyond adding the logo with safe constraints.
- Must work with **SVG input** reliably (rasterize + flatten).
- Must preserve current receipt dimensions and not overflow.

---

## Configuration
Add env variables:
- `RECEIPT_PAPER_MM` default `80`
- `RECEIPT_PADDING_MM` default `4`
- `RECEIPT_LOGO_MAX_HEIGHT_MM` default `18`
- `RECEIPT_DPI` default `203`
- `RECEIPT_LOGO_THRESHOLD` default `185`

Compute content width in pixels using these:
- `paperWidthPx = round(RECEIPT_PAPER_MM / 25.4 * RECEIPT_DPI)`
- `paddingPx = round(RECEIPT_PADDING_MM / 25.4 * RECEIPT_DPI)`
- `contentWidthPx = paperWidthPx - (2 * paddingPx)`

Use `contentWidthPx` as the target width for the processed logo.

---

## Processing pipeline (implement using `sharp`)
### Input: SVG/PNG/JPEG buffer
At upload time, generate:
- `logo_processed.png` (single derived asset)

Processing steps (in order):
1. `rotate()` to respect EXIF (for JPEGs)
2. `resize({ width: contentWidthPx, withoutEnlargement: true })`
3. `flatten({ background: "#ffffff" })` (important for transparent PNG/SVG)
4. `grayscale()`
5. `sharpen()` (light)
6. `threshold(RECEIPT_LOGO_THRESHOLD)` to improve thermal contrast
7. output as PNG, high compression

Do NOT dither yet (threshold only).

---

## Storage layout (disk)
Use a persistent data directory (existing app data dir).
Create:
- `<DATA_DIR>/assets/logos/<logoId>/original.<ext>`
- `<DATA_DIR>/assets/logos/<logoId>/processed.png`

Where `<logoId>` is UUID.

---

## Database changes (Prisma)
Add a small `Asset` or `LogoAsset` model for metadata:
- `id` (uuid)
- `kind` enum: `RECEIPT_LOGO`
- `mimeType`
- `originalPath`
- `processedPath`
- `sha256`
- `createdAt`

Then add a nullable reference in the receipt config owner (branch/subdivision as currently used):
- e.g. `receiptLogoAssetId String?`
- Relation to `Asset`

Do not change other receipt fields.

---

## Backend API
### 1) Upload endpoint
Create a controller endpoint:
- `POST /api/v1/receipt-logo`
Accept multipart form upload:
- field name: `file`

Server behavior:
- validate file type (svg/png/jpeg)
- save original to disk
- run processing pipeline to create `processed.png`
- save metadata row in DB
- attach it to the current receipt config scope (branch/subdivision per your current design)
- return JSON:
```json
{
  "assetId": "...",
  "processedUrl": "/api/v1/assets/<assetId>/processed"
}
```
### 2) Serve processed logo
Add endpoint:
- GET /api/v1/assets/:id/processed
Return the processed.png file with correct Content-Type: image/png.
Use safe path resolution (no directory traversal).

## Frontend changes
### Receipt Settings UI
In the receipt settings screen:

- Add “Upload Logo” button/input
- On upload success, store returned assetId in the receipt settings via existing update endpoint or a new dedicated endpoint if needed.
- Show a preview of the processed logo using processedUrl.

### Receipts (HTML + PDF)
Wherever the receipt template is built:
- If receiptLogoAssetId exists, render an <img> at the top using the processed URL.
- Apply strict CSS constraints:
```css
.receipt-logo {
  display: block;
  width: 100%;
  height: auto;
  max-height: var(--logo-max-height); /* from env/config, e.g. 18mm */
  object-fit: contain;
}
```
- Ensure the receipt container keeps its existing width and padding. Do not increase it.

For PDF generation:
- If PDF is generated from HTML (Puppeteer): ensure the same CSS applies.
- If PDF is generated programmatically: embed the processed PNG, constrain width to content width and cap height.

## Quality & Validation checklist
1. Upload SVG → processed PNG created
2. Processed PNG width ≤ contentWidthPx
3. Receipt HTML prints with logo without overflow or clipping
4. PDF includes logo and respects same bounds
5. No image processing occurs at print time
6. Existing receipt rendering remains unchanged except logo block
7. Graceful errors: invalid file types, missing asset, etc.

## Implementation notes

- Use multer (or existing upload middleware) in NestJS.
- Compute contentWidthPx from env vars in a shared config/service used by both processing and rendering.
- Do not hardcode paths; use DATA_DIR (existing) or add it as env var.
- Keep code changes minimal and localized.

---

Inputs you will receive
- An SVG file for testing (logo).
- Existing codebase with receipt settings and receipt templates.

Deliver:
- Updated Prisma schema + migration
- Backend endpoints
- File storage + processing service
- Frontend upload UI + receipt integration (HTML & PDF)
- Any necessary wiring/config

Proceed to implement end-to-end.
