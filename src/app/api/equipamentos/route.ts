import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isClinicalEngineering } from "@/lib/rbac";
import { ecEquipmentRequestSchema } from "@/lib/validators/request";
import { generateProtocol, generateSupplierToken, generateInternalOs } from "@/lib/utils";
import { createAuditLog } from "@/lib/audit";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !isClinicalEngineering(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = ecEquipmentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", ") || "Dados inválidos" },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.equipmentClass === "A" && !data.boardAuthorization) {
    return NextResponse.json(
      { error: "Classe A exige autorização formal da diretoria" },
      { status: 400 }
    );
  }

  const alreadyInPark = !!data.alreadyInPark;

  // Nota fiscal: usa a existente (invoiceId) ou cria/reaproveita pelo número
  let invoiceId = data.invoiceId || undefined;
  if (!invoiceId && data.invoiceNumber) {
    const invoice = await prisma.invoice.upsert({
      where: { number: data.invoiceNumber },
      update: {},
      create: {
        number: data.invoiceNumber,
        issueDate: data.invoiceDate,
        supplierId: data.supplierId || undefined,
        supplierName: data.supplierName,
        createdById: session.user.id,
      },
    });
    invoiceId = invoice.id;
  }

  const request = await prisma.equipmentRequest.create({
    data: {
      protocol: generateProtocol(),
      supplierToken: generateSupplierToken(),
      qrToken: randomUUID(),
      internalOs: generateInternalOs(),
      status: "AGUARDANDO_DOCUMENTOS",
      flowType: "ELETIVO",
      originatedByEc: true,
      alreadyInPark,
      registeredById: session.user.id,
      requesterName: session.user.name ?? "Engenharia Clínica",
      requestDate: new Date(),
      entryDate: new Date(),
      submittedAt: new Date(),
      usageSector: data.usageSector,
      destinationSector: data.usageSector,
      doctorCrm: "",
      patientName: "",
      medicalRecord: "",
      plannedProcedure: data.plannedProcedure ?? (alreadyInPark ? "Formalização de equipamento do parque" : ""),
      plannedDate: new Date(),
      plannedTime: "08:00",
      clinicalJustification:
        data.clinicalJustification ??
        (alreadyInPark ? "Equipamento já em uso no parque tecnológico — regularização documental." : ""),
      noInstitutionalAlternative: false,
      technicalBenefit: "",
      equipmentName: data.equipmentName,
      brand: data.brand,
      model: data.model,
      serialNumber: data.serialNumber,
      entryType: data.entryType,
      equipmentClass: data.equipmentClass,
      supplierId: data.supplierId || undefined,
      supplierName: data.supplierName,
      invoiceId,
      ownerName: data.ownerName,
      ownerContact: data.ownerContact,
      ownerDocument: data.ownerDocument,
      originPatrimony: data.originPatrimony,
      storageLocation: data.storageLocation,
      boardAuthorization: data.boardAuthorization,
      assistentialRisk: "",
      isUrgent: false,
      wizardStep: 5,
      documentChecklist: { create: {} },
      releaseStatus: { create: {} },
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: alreadyInPark ? "EQUIPMENT_FORMALIZATION_CREATED" : "EQUIPMENT_CREATED_BY_EC",
    entity: "EquipmentRequest",
    entityId: request.id,
    metadata: { protocol: request.protocol, alreadyInPark },
  });

  return NextResponse.json(request, { status: 201 });
}
