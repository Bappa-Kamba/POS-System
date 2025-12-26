-- CreateTable
CREATE TABLE "app_licenses" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'SYSTEM_LICENSE',
    "shopCode" TEXT NOT NULL,
    "licenseStatus" TEXT NOT NULL DEFAULT 'TRIAL',
    "trialExpiresAt" DATETIME NOT NULL,
    "activatedAt" DATETIME,
    "unlockCodeHash" TEXT NOT NULL,
    "lastCheckedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "app_licenses_shopCode_key" ON "app_licenses"("shopCode");
