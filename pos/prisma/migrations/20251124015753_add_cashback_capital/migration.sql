-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_branches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "taxRate" REAL NOT NULL DEFAULT 0.075,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "businessName" TEXT,
    "businessAddress" TEXT,
    "businessPhone" TEXT,
    "receiptFooter" TEXT,
    "cashbackCapital" REAL NOT NULL DEFAULT 0,
    "cashbackServiceChargeRate" REAL NOT NULL DEFAULT 0.02,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_branches" ("address", "businessAddress", "businessName", "businessPhone", "createdAt", "currency", "email", "id", "location", "name", "phone", "receiptFooter", "taxRate", "updatedAt") SELECT "address", "businessAddress", "businessName", "businessPhone", "createdAt", "currency", "email", "id", "location", "name", "phone", "receiptFooter", "taxRate", "updatedAt" FROM "branches";
DROP TABLE "branches";
ALTER TABLE "new_branches" RENAME TO "branches";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
