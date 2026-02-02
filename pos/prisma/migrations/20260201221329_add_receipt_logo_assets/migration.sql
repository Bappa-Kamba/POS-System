-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "originalPath" TEXT NOT NULL,
    "processedPath" TEXT,
    "fileSizeBytes" INTEGER NOT NULL,
    "sha256" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

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
    "receiptFooter" TEXT,
    "receiptLogoAssetId" TEXT,
    "cashbackCapital" REAL NOT NULL DEFAULT 0,
    "cashbackServiceChargeRate" REAL NOT NULL DEFAULT 0.02,
    "cashbackSubdivisionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "branches_receiptLogoAssetId_fkey" FOREIGN KEY ("receiptLogoAssetId") REFERENCES "assets" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_branches" ("address", "cashbackCapital", "cashbackServiceChargeRate", "cashbackSubdivisionId", "createdAt", "currency", "email", "id", "location", "name", "phone", "receiptFooter", "taxRate", "updatedAt") SELECT "address", "cashbackCapital", "cashbackServiceChargeRate", "cashbackSubdivisionId", "createdAt", "currency", "email", "id", "location", "name", "phone", "receiptFooter", "taxRate", "updatedAt" FROM "branches";
DROP TABLE "branches";
ALTER TABLE "new_branches" RENAME TO "branches";
CREATE TABLE "new_subdivisions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "color" TEXT,
    "icon" TEXT,
    "receiptBusinessName" TEXT,
    "receiptAddress" TEXT,
    "receiptPhone" TEXT,
    "receiptFooter" TEXT,
    "receiptLogoAssetId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "subdivisions_receiptLogoAssetId_fkey" FOREIGN KEY ("receiptLogoAssetId") REFERENCES "assets" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_subdivisions" ("color", "createdAt", "description", "displayName", "icon", "id", "name", "receiptAddress", "receiptBusinessName", "receiptFooter", "receiptPhone", "status", "updatedAt") SELECT "color", "createdAt", "description", "displayName", "icon", "id", "name", "receiptAddress", "receiptBusinessName", "receiptFooter", "receiptPhone", "status", "updatedAt" FROM "subdivisions";
DROP TABLE "subdivisions";
ALTER TABLE "new_subdivisions" RENAME TO "subdivisions";
CREATE UNIQUE INDEX "subdivisions_name_key" ON "subdivisions"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
