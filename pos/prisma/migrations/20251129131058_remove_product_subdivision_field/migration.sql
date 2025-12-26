/*
  Warnings:

  - You are about to drop the column `subdivisionId` on the `products` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "hasVariants" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT,
    "costPrice" REAL,
    "sellingPrice" REAL,
    "quantityInStock" REAL,
    "unitType" TEXT NOT NULL DEFAULT 'PIECE',
    "lowStockThreshold" REAL,
    "trackInventory" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "branchId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_products" ("barcode", "branchId", "categoryId", "costPrice", "createdAt", "description", "hasVariants", "id", "isActive", "lowStockThreshold", "name", "quantityInStock", "sellingPrice", "sku", "trackInventory", "unitType", "updatedAt") SELECT "barcode", "branchId", "categoryId", "costPrice", "createdAt", "description", "hasVariants", "id", "isActive", "lowStockThreshold", "name", "quantityInStock", "sellingPrice", "sku", "trackInventory", "unitType", "updatedAt" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");
CREATE INDEX "products_sku_idx" ON "products"("sku");
CREATE INDEX "products_barcode_idx" ON "products"("barcode");
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX "products_branchId_idx" ON "products"("branchId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
