/*
  Warnings:

  - You are about to drop the column `category` on the `products` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "subdivisions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "color" TEXT,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "branch_subdivisions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "subdivisionId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "branch_subdivisions_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "branch_subdivisions_subdivisionId_fkey" FOREIGN KEY ("subdivisionId") REFERENCES "subdivisions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subdivisionId" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "categories_subdivisionId_fkey" FOREIGN KEY ("subdivisionId") REFERENCES "subdivisions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    CONSTRAINT "products_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_products" ("barcode", "branchId", "costPrice", "createdAt", "description", "hasVariants", "id", "isActive", "lowStockThreshold", "name", "quantityInStock", "sellingPrice", "sku", "subdivision", "taxRate", "taxable", "trackInventory", "unitType", "updatedAt") SELECT "barcode", "branchId", "costPrice", "createdAt", "description", "hasVariants", "id", "isActive", "lowStockThreshold", "name", "quantityInStock", "sellingPrice", "sku", "subdivision", "taxRate", "taxable", "trackInventory", "unitType", "updatedAt" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");
CREATE INDEX "products_sku_idx" ON "products"("sku");
CREATE INDEX "products_barcode_idx" ON "products"("barcode");
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX "products_branchId_idx" ON "products"("branchId");
CREATE INDEX "products_subdivision_idx" ON "products"("subdivision");
CREATE INDEX "products_branchId_subdivision_idx" ON "products"("branchId", "subdivision");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "subdivisions_name_key" ON "subdivisions"("name");

-- CreateIndex
CREATE INDEX "branch_subdivisions_branchId_idx" ON "branch_subdivisions"("branchId");

-- CreateIndex
CREATE INDEX "branch_subdivisions_subdivisionId_idx" ON "branch_subdivisions"("subdivisionId");

-- CreateIndex
CREATE UNIQUE INDEX "branch_subdivisions_branchId_subdivisionId_key" ON "branch_subdivisions"("branchId", "subdivisionId");

-- CreateIndex
CREATE INDEX "categories_subdivisionId_idx" ON "categories"("subdivisionId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_subdivisionId_key" ON "categories"("name", "subdivisionId");
