-- CreateTable
CREATE TABLE "AccessInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "requesterPhone" TEXT,
    "doctorCrm" TEXT,
    "entryType" TEXT NOT NULL DEFAULT 'MEDICO',
    "note" TEXT,
    "createdById" TEXT,
    "expiresAt" DATETIME,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EquipmentRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "protocol" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "requestDate" DATETIME NOT NULL,
    "usageSector" TEXT NOT NULL,
    "doctorId" TEXT,
    "doctorCrm" TEXT NOT NULL,
    "requesterName" TEXT,
    "requesterEmail" TEXT,
    "requesterPhone" TEXT,
    "submittedViaPublic" BOOLEAN NOT NULL DEFAULT false,
    "accessInviteId" TEXT,
    "patientName" TEXT NOT NULL,
    "medicalRecord" TEXT NOT NULL,
    "plannedProcedure" TEXT NOT NULL,
    "plannedDate" DATETIME NOT NULL,
    "plannedTime" TEXT NOT NULL,
    "clinicalJustification" TEXT NOT NULL,
    "noInstitutionalAlternative" BOOLEAN NOT NULL,
    "technicalBenefit" TEXT NOT NULL,
    "equipmentName" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "supplierId" TEXT,
    "supplierName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerContact" TEXT NOT NULL,
    "ownerDocument" TEXT,
    "assistentialRisk" TEXT NOT NULL,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "entryType" TEXT NOT NULL DEFAULT 'MEDICO',
    "flowType" TEXT NOT NULL DEFAULT 'ELETIVO',
    "equipmentClass" TEXT,
    "internalOs" TEXT,
    "originPatrimony" TEXT,
    "destinationSector" TEXT,
    "entryDate" DATETIME,
    "expectedExitDate" DATETIME,
    "storageLocation" TEXT,
    "boardAuthorization" TEXT,
    "registeredById" TEXT,
    "qrToken" TEXT,
    "urgencyAuthorizer" TEXT,
    "regularizationDueAt" DATETIME,
    "regularizedAt" DATETIME,
    "supplierToken" TEXT,
    "equipmentId" TEXT,
    "wizardStep" INTEGER NOT NULL DEFAULT 1,
    "submittedAt" DATETIME,
    "homologatedAt" DATETIME,
    "releasedAt" DATETIME,
    "validUntil" DATETIME,
    "withdrawnAt" DATETIME,
    "restrictionNotes" TEXT,
    "blockReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EquipmentRequest_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EquipmentRequest_accessInviteId_fkey" FOREIGN KEY ("accessInviteId") REFERENCES "AccessInvite" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EquipmentRequest_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EquipmentRequest_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EquipmentRequest" ("assistentialRisk", "blockReason", "boardAuthorization", "brand", "clinicalJustification", "createdAt", "destinationSector", "doctorCrm", "doctorId", "entryDate", "entryType", "equipmentClass", "equipmentId", "equipmentName", "expectedExitDate", "flowType", "homologatedAt", "id", "internalOs", "isUrgent", "medicalRecord", "model", "noInstitutionalAlternative", "originPatrimony", "ownerContact", "ownerDocument", "ownerName", "patientName", "plannedDate", "plannedProcedure", "plannedTime", "protocol", "qrToken", "registeredById", "regularizationDueAt", "regularizedAt", "releasedAt", "requestDate", "requesterEmail", "requesterName", "requesterPhone", "restrictionNotes", "serialNumber", "status", "storageLocation", "submittedAt", "submittedViaPublic", "supplierId", "supplierName", "supplierToken", "technicalBenefit", "updatedAt", "urgencyAuthorizer", "usageSector", "validUntil", "withdrawnAt", "wizardStep") SELECT "assistentialRisk", "blockReason", "boardAuthorization", "brand", "clinicalJustification", "createdAt", "destinationSector", "doctorCrm", "doctorId", "entryDate", "entryType", "equipmentClass", "equipmentId", "equipmentName", "expectedExitDate", "flowType", "homologatedAt", "id", "internalOs", "isUrgent", "medicalRecord", "model", "noInstitutionalAlternative", "originPatrimony", "ownerContact", "ownerDocument", "ownerName", "patientName", "plannedDate", "plannedProcedure", "plannedTime", "protocol", "qrToken", "registeredById", "regularizationDueAt", "regularizedAt", "releasedAt", "requestDate", "requesterEmail", "requesterName", "requesterPhone", "restrictionNotes", "serialNumber", "status", "storageLocation", "submittedAt", "submittedViaPublic", "supplierId", "supplierName", "supplierToken", "technicalBenefit", "updatedAt", "urgencyAuthorizer", "usageSector", "validUntil", "withdrawnAt", "wizardStep" FROM "EquipmentRequest";
DROP TABLE "EquipmentRequest";
ALTER TABLE "new_EquipmentRequest" RENAME TO "EquipmentRequest";
CREATE UNIQUE INDEX "EquipmentRequest_protocol_key" ON "EquipmentRequest"("protocol");
CREATE UNIQUE INDEX "EquipmentRequest_internalOs_key" ON "EquipmentRequest"("internalOs");
CREATE UNIQUE INDEX "EquipmentRequest_qrToken_key" ON "EquipmentRequest"("qrToken");
CREATE UNIQUE INDEX "EquipmentRequest_supplierToken_key" ON "EquipmentRequest"("supplierToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AccessInvite_key_key" ON "AccessInvite"("key");

-- CreateIndex
CREATE INDEX "AccessInvite_key_idx" ON "AccessInvite"("key");
