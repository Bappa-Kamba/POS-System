-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sales" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiptNumber" TEXT NOT NULL,
    "cashierId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "subdivisionId" TEXT,
    "transactionType" TEXT NOT NULL DEFAULT 'PURCHASE',
    "subtotal" REAL NOT NULL,
    "taxAmount" REAL NOT NULL,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "amountDue" REAL NOT NULL,
    "changeGiven" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "sessionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sales_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sales_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sales_subdivisionId_fkey" FOREIGN KEY ("subdivisionId") REFERENCES "subdivisions" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "sales_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_sales" ("amountDue", "amountPaid", "branchId", "cashierId", "changeGiven", "createdAt", "customerName", "customerPhone", "discountAmount", "id", "notes", "paymentStatus", "receiptNumber", "sessionId", "subtotal", "taxAmount", "totalAmount", "transactionType", "updatedAt") SELECT "amountDue", "amountPaid", "branchId", "cashierId", "changeGiven", "createdAt", "customerName", "customerPhone", "discountAmount", "id", "notes", "paymentStatus", "receiptNumber", "sessionId", "subtotal", "taxAmount", "totalAmount", "transactionType", "updatedAt" FROM "sales";
DROP TABLE "sales";
ALTER TABLE "new_sales" RENAME TO "sales";
CREATE UNIQUE INDEX "sales_receiptNumber_key" ON "sales"("receiptNumber");
CREATE INDEX "sales_receiptNumber_idx" ON "sales"("receiptNumber");
CREATE INDEX "sales_cashierId_idx" ON "sales"("cashierId");
CREATE INDEX "sales_branchId_idx" ON "sales"("branchId");
CREATE INDEX "sales_createdAt_idx" ON "sales"("createdAt");
CREATE INDEX "sales_paymentStatus_idx" ON "sales"("paymentStatus");
CREATE INDEX "sales_transactionType_idx" ON "sales"("transactionType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
