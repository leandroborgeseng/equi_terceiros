import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicRequestSchema } from "@/lib/validators/request";
import { generateProtocol, generateSupplierToken } from "@/lib/utils";
import { suggestEquipmentClass } from "@/lib/classification";
import { createAuditLog } from "@/lib/audit";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = publicRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", ") || "Dados inválidos" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const isUrgent = !!data.isUrgent;

  // Chave de acesso (opcional) — valida e vincula a solicitação ao convite
  let accessInviteId: string | undefined;
  const inviteKey = typeof body.inviteKey === "string" ? body.inviteKey : undefined;
  if (inviteKey) {
    const invite = await prisma.accessInvite.findUnique({ where: { key: inviteKey } });
    if (!invite || invite.revokedAt || (invite.expiresAt && new Date(invite.expiresAt) < new Date())) {
      return NextResponse.json({ error: "Chave de acesso inválida ou expirada" }, { status: 400 });
    }
    accessInviteId = invite.id;
  }

  const equipmentClass = suggestEquipmentClass({
    isUrgent,
    plannedDate: data.plannedDate,
  });

  const protocol = generateProtocol();
  const supplierToken = generateSupplierToken();

  const request = await prisma.equipmentRequest.create({
    data: {
      protocol,
      supplierToken,
      qrToken: randomUUID(),
      status: isUrgent ? "FLUXO_URGENCIA" : "AGUARDANDO_CADASTRO",
      flowType: isUrgent ? "URGENCIA" : "ELETIVO",
      equipmentClass,
      submittedViaPublic: true,
      accessInviteId,
      submittedAt: new Date(),
      requestDate: new Date(),
      requesterName: data.requesterName,
      requesterEmail: data.requesterEmail,
      requesterPhone: data.requesterPhone,
      doctorCrm: data.doctorCrm ?? "",
      usageSector: data.usageSector,
      patientName: data.patientName ?? "",
      medicalRecord: data.medicalRecord ?? "",
      plannedProcedure: data.plannedProcedure,
      plannedDate: data.plannedDate,
      plannedTime: data.plannedTime,
      clinicalJustification: data.clinicalJustification,
      noInstitutionalAlternative: data.noInstitutionalAlternative ?? false,
      technicalBenefit: data.technicalBenefit ?? "",
      equipmentName: data.equipmentName,
      brand: data.brand,
      model: data.model,
      serialNumber: data.serialNumber ?? "",
      entryType: data.entryType,
      supplierName: data.supplierName,
      ownerName: data.ownerName,
      ownerContact: data.ownerContact,
      ownerDocument: data.ownerDocument,
      assistentialRisk: data.assistentialRisk ?? "",
      isUrgent,
      regularizationDueAt: isUrgent ? new Date(Date.now() + 86400000) : undefined,
      wizardStep: 5,
      documentChecklist: { create: {} },
      releaseStatus: { create: {} },
    },
  });

  await createAuditLog({
    action: "PUBLIC_REQUEST_CREATED",
    entity: "EquipmentRequest",
    entityId: request.id,
    metadata: { protocol, requester: data.requesterName, public: true, inviteKey: inviteKey ?? null },
  });

  return NextResponse.json(
    { id: request.id, protocol: request.protocol, supplierToken: request.supplierToken },
    { status: 201 }
  );
}
