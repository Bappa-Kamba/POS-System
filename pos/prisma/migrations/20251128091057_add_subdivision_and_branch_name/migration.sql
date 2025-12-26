-- AlterTable
ALTER TABLE "users" ADD COLUMN "assignedSubdivision" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "category" TEXT NOT NULL,
    "hasVariants" BOOLEAN NOT NULL DEFAULT false,
    "subdivision" TEXT NOT NULL DEFAULT 'CASHBACK_ACCESSORIES',
    "costPrice" REAL,
    "sellingPrice" REAL,
    "quantityInStock" REAL,
    "unitType" TEXT NOT NULL DEFAULT 'PIECE',
    "lowStockThreshold" REAL,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "taxRate" REAL,
    "trackInventory" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "branchId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_products" ("barcode", "branchId", "category", "costPrice", "createdAt", "description", "hasVariants", "id", "isActive", "lowStockThreshold", "name", "quantityInStock", "sellingPrice", "sku", "taxRate", "taxable", "trackInventory", "unitType", "updatedAt") SELECT "barcode", "branchId", "category", "costPrice", "createdAt", "description", "hasVariants", "id", "isActive", "lowStockThreshold", "name", "quantityInStock", "sellingPrice", "sku", "taxRate", "taxable", "trackInventory", "unitType", "updatedAt" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");
CREATE INDEX "products_sku_idx" ON "products"("sku");
CREATE INDEX "products_barcode_idx" ON "products"("barcode");
CREATE INDEX "products_category_idx" ON "products"("category");
CREATE INDEX "products_branchId_idx" ON "products"("branchId");
CREATE INDEX "products_subdivision_idx" ON "products"("subdivision");
CREATE INDEX "products_branchId_subdivision_idx" ON "products"("branchId", "subdivision");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "users_assignedSubdivision_idx" ON "users"("assignedSubdivision");
