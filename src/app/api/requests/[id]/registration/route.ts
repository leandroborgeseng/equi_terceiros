import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { equipmentRegistrationSchema } from "@/lib/validators/request";
import { canHomologate } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";
import { generateInternalOs } from "@/lib/utils";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !canHomologate(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = equipmentRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.equipmentRequest.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  // Regra: Classe A exige autorização formal da diretoria
  if (parsed.data.equipmentClass === "A" && !parsed.data.boardAuthorization) {
    return NextResponse.json(
      { error: "Classe A exige autorização formal da diretoria" },
      { status: 400 }
    );
  }

  const internalOs = existing.internalOs ?? generateInternalOs();

  const updated = await prisma.equipmentRequest.update({
    where: { id },
    data: {
      serialNumber: parsed.data.serialNumber,
      originPatrimony: parsed.data.originPatrimony,
      equipmentClass: parsed.data.equipmentClass,
      destinationSector: parsed.data.destinationSector,
      entryDate: parsed.data.entryDate,
      expectedExitDate: parsed.data.expectedExitDate,
      storageLocation: parsed.data.storageLocation,
      boardAuthorization: parsed.data.boardAuthorization,
      internalOs,
      registeredById: session.user.id,
      status: existing.status === "FLUXO_URGENCIA" ? "FLUXO_URGENCIA" : "AGUARDANDO_DOCUMENTOS",
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "EQUIPMENT_REGISTERED",
    entity: "EquipmentRequest",
    entityId: id,
    metadata: { internalOs, equipmentClass: parsed.data.equipmentClass },
  });

  return NextResponse.json(updated);
}
