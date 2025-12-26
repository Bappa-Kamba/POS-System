/*
  Warnings:

  - You are about to drop the column `subdivision` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `taxRate` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `taxable` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `assignedSubdivision` on the `users` table. All the data in the column will be lost.

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
    "subdivisionId" TEXT,
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
CREATE INDEX "products_subdivisionId_idx" ON "products"("subdivisionId");
CREATE INDEX "products_branchId_subdivisionId_idx" ON "products"("branchId", "subdivisionId");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "refreshTokenHash" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CASHIER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "branchId" TEXT NOT NULL,
    "assignedSubdivisionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_users" ("branchId", "createdAt", "email", "firstName", "id", "isActive", "lastName", "passwordHash", "refreshTokenHash", "role", "updatedAt", "username") SELECT "branchId", "createdAt", "email", "firstName", "id", "isActive", "lastName", "passwordHash", "refreshTokenHash", "role", "updatedAt", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_username_idx" ON "users"("username");
CREATE INDEX "users_branchId_idx" ON "users"("branchId");
CREATE INDEX "users_assignedSubdivisionId_idx" ON "users"("assignedSubdivisionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
