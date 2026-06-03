-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "crm" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Supplier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "anvisaNumber" TEXT,
    "ownerName" TEXT,
    "ownerContact" TEXT,
    "riskLevel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EquipmentRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "protocol" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "requestDate" DATETIME NOT NULL,
    "usageSector" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "doctorCrm" TEXT NOT NULL,
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
    CONSTRAINT "EquipmentRequest_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EquipmentRequest_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EquipmentRequest_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "uploadedBy" TEXT,
    "checksum" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attachment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "EquipmentRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentChecklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "item1Status" TEXT NOT NULL DEFAULT 'NA',
    "item1Obs" TEXT,
    "item1FileKey" TEXT,
    "item2Status" TEXT NOT NULL DEFAULT 'NA',
    "item2Obs" TEXT,
    "item2FileKey" TEXT,
    "item3Status" TEXT NOT NULL DEFAULT 'NA',
    "item3Obs" TEXT,
    "item3FileKey" TEXT,
    "item4Status" TEXT NOT NULL DEFAULT 'NA',
    "item4Obs" TEXT,
    "item4FileKey" TEXT,
    "item5Status" TEXT NOT NULL DEFAULT 'NA',
    "item5Obs" TEXT,
    "item5FileKey" TEXT,
    "item6Status" TEXT NOT NULL DEFAULT 'NA',
    "item6Obs" TEXT,
    "item6FileKey" TEXT,
    "item7Status" TEXT NOT NULL DEFAULT 'NA',
    "item7Obs" TEXT,
    "item7FileKey" TEXT,
    "item8Status" TEXT NOT NULL DEFAULT 'NA',
    "item8Obs" TEXT,
    "item8FileKey" TEXT,
    "docStatus" TEXT NOT NULL DEFAULT 'PENDENTE',
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DocumentChecklist_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "EquipmentRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TechnicalInspection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "item1Status" TEXT NOT NULL DEFAULT 'NA',
    "item2Status" TEXT NOT NULL DEFAULT 'NA',
    "item3Status" TEXT NOT NULL DEFAULT 'NA',
    "item4Status" TEXT NOT NULL DEFAULT 'NA',
    "item5Status" TEXT NOT NULL DEFAULT 'NA',
    "item6Status" TEXT NOT NULL DEFAULT 'NA',
    "item7Status" TEXT NOT NULL DEFAULT 'NA',
    "electricalSafetyTest" TEXT NOT NULL DEFAULT 'NA',
    "electricalSafetyResult" TEXT,
    "cmeRequired" BOOLEAN NOT NULL DEFAULT false,
    "generalNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "restrictionNotes" TEXT,
    "blockReason" TEXT,
    "signatureData" TEXT,
    "labelPrintedAt" DATETIME,
    "inspectedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TechnicalInspection_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "EquipmentRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TechnicalInspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReleaseStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "labelStatus" TEXT NOT NULL DEFAULT 'PENDENTE_ANALISE',
    "labelPdfKey" TEXT,
    "validUntil" DATETIME,
    "sector" TEXT,
    "restriction" TEXT,
    "blockReason" TEXT,
    "technicalLead" TEXT,
    "generatedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReleaseStatus_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "EquipmentRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenanceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "performedAt" DATETIME NOT NULL,
    "validUntil" DATETIME NOT NULL,
    "provider" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MaintenanceRecord_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CalibrationRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "performedAt" DATETIME NOT NULL,
    "validUntil" DATETIME NOT NULL,
    "certificateKey" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CalibrationRecord_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ElectricalSafetyTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "performedAt" DATETIME NOT NULL,
    "validUntil" DATETIME NOT NULL,
    "result" TEXT,
    "certificateKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ElectricalSafetyTest_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResponsibilityTerm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "pdfKey" TEXT,
    "signedAt" DATETIME,
    "signedByDoctor" BOOLEAN NOT NULL DEFAULT false,
    "signedBySupplier" BOOLEAN NOT NULL DEFAULT false,
    "signatureHash" TEXT,
    "generatedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ResponsibilityTerm_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "EquipmentRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResponsibilityTerm_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EquipmentImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT,
    "requestId" TEXT,
    "photoType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "qualityScore" REAL,
    "uploadedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EquipmentImage_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EquipmentImageMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageId" TEXT NOT NULL,
    "imageType" TEXT NOT NULL,
    "extractedText" TEXT,
    "serialDetected" TEXT,
    "manufacturerDetected" TEXT,
    "modelDetected" TEXT,
    "aiValidationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EquipmentImageMetadata_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "EquipmentImage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "equipmentId" TEXT,
    "requestId" TEXT,
    "dueDate" DATETIME,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Alert_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Alert_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "EquipmentRequest" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdverseEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdverseEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "EquipmentRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AdverseEvent_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StorageRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "storedAt" DATETIME NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StorageRecord_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WithdrawalRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "withdrawnAt" DATETIME NOT NULL,
    "withdrawnBy" TEXT NOT NULL,
    "reason" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WithdrawalRecord_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_userId_key" ON "Supplier"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentRequest_protocol_key" ON "EquipmentRequest"("protocol");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentRequest_internalOs_key" ON "EquipmentRequest"("internalOs");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentRequest_qrToken_key" ON "EquipmentRequest"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentRequest_supplierToken_key" ON "EquipmentRequest"("supplierToken");

-- CreateIndex
CREATE INDEX "Attachment_requestId_type_idx" ON "Attachment"("requestId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentChecklist_requestId_key" ON "DocumentChecklist"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalInspection_requestId_key" ON "TechnicalInspection"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseStatus_requestId_key" ON "ReleaseStatus"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "ResponsibilityTerm_requestId_key" ON "ResponsibilityTerm"("requestId");

-- CreateIndex
CREATE INDEX "EquipmentImage_requestId_idx" ON "EquipmentImage"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentImageMetadata_imageId_key" ON "EquipmentImageMetadata"("imageId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
