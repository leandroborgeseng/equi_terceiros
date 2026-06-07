-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ResponsibilityTerm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "pdfKey" TEXT,
    "signedAt" DATETIME,
    "signedByDoctor" BOOLEAN NOT NULL DEFAULT false,
    "signedBySupplier" BOOLEAN NOT NULL DEFAULT false,
    "signatureHash" TEXT,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "signerName" TEXT,
    "signatureData" TEXT,
    "ecReviewed" BOOLEAN NOT NULL DEFAULT false,
    "ecReviewerId" TEXT,
    "generatedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ResponsibilityTerm_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "EquipmentRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResponsibilityTerm_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ResponsibilityTerm" ("createdAt", "generatedById", "id", "pdfKey", "requestId", "signatureHash", "signedAt", "signedByDoctor", "signedBySupplier", "updatedAt") SELECT "createdAt", "generatedById", "id", "pdfKey", "requestId", "signatureHash", "signedAt", "signedByDoctor", "signedBySupplier", "updatedAt" FROM "ResponsibilityTerm";
DROP TABLE "ResponsibilityTerm";
ALTER TABLE "new_ResponsibilityTerm" RENAME TO "ResponsibilityTerm";
CREATE UNIQUE INDEX "ResponsibilityTerm_requestId_key" ON "ResponsibilityTerm"("requestId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
