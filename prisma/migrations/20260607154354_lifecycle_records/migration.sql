-- AlterTable
ALTER TABLE "EquipmentRequest" ADD COLUMN "inUseAt" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StorageRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT,
    "requestId" TEXT,
    "location" TEXT NOT NULL,
    "storedAt" DATETIME NOT NULL,
    "storedBy" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StorageRecord_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StorageRecord_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "EquipmentRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StorageRecord" ("createdAt", "equipmentId", "id", "location", "notes", "storedAt") SELECT "createdAt", "equipmentId", "id", "location", "notes", "storedAt" FROM "StorageRecord";
DROP TABLE "StorageRecord";
ALTER TABLE "new_StorageRecord" RENAME TO "StorageRecord";
CREATE INDEX "StorageRecord_requestId_idx" ON "StorageRecord"("requestId");
CREATE TABLE "new_WithdrawalRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT,
    "requestId" TEXT,
    "withdrawnAt" DATETIME NOT NULL,
    "withdrawnBy" TEXT NOT NULL,
    "reason" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WithdrawalRecord_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WithdrawalRecord_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "EquipmentRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WithdrawalRecord" ("completed", "createdAt", "equipmentId", "id", "reason", "withdrawnAt", "withdrawnBy") SELECT "completed", "createdAt", "equipmentId", "id", "reason", "withdrawnAt", "withdrawnBy" FROM "WithdrawalRecord";
DROP TABLE "WithdrawalRecord";
ALTER TABLE "new_WithdrawalRecord" RENAME TO "WithdrawalRecord";
CREATE INDEX "WithdrawalRecord_requestId_idx" ON "WithdrawalRecord"("requestId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
