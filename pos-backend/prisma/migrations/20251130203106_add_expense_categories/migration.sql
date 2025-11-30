-- CreateTable
CREATE TABLE "expense_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "branchId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "expense_categories_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "expense_categories_branchId_idx" ON "expense_categories"("branchId");

-- CreateIndex
CREATE INDEX "expense_categories_name_idx" ON "expense_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "expense_categories_name_branchId_key" ON "expense_categories"("name", "branchId");
