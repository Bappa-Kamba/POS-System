/*
  Warnings:

  - You are about to drop the column `businessAddress` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `businessName` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `businessPhone` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `receiptFooter` on the `branches` table. All the data in the column will be lost.

*/
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
    "cashbackCapital" REAL NOT NULL DEFAULT 0,
    "cashbackServiceChargeRate" REAL NOT NULL DEFAULT 0.02,
    "cashbackSubdivisionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_branches" ("address", "cashbackCapital", "cashbackServiceChargeRate", "cashbackSubdivisionId", "createdAt", "currency", "email", "id", "location", "name", "phone", "taxRate", "updatedAt") SELECT "address", "cashbackCapital", "cashbackServiceChargeRate", "cashbackSubdivisionId", "createdAt", "currency", "email", "id", "location", "name", "phone", "taxRate", "updatedAt" FROM "branches";
DROP TABLE "branches";
ALTER TABLE "new_branches" RENAME TO "branches";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
