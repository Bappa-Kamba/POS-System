-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_expenses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    "branchId" TEXT NOT NULL,
    "sessionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "expenses_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "expenses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_expenses" ("amount", "branchId", "category", "createdAt", "date", "description", "id", "title", "updatedAt") SELECT "amount", "branchId", "category", "createdAt", "date", "description", "id", "title", "updatedAt" FROM "expenses";
DROP TABLE "expenses";
ALTER TABLE "new_expenses" RENAME TO "expenses";
CREATE INDEX "expenses_branchId_idx" ON "expenses"("branchId");
CREATE INDEX "expenses_sessionId_idx" ON "expenses"("sessionId");
CREATE INDEX "expenses_date_idx" ON "expenses"("date");
CREATE INDEX "expenses_category_idx" ON "expenses"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
