import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inspectionSchema } from "@/lib/validators/request";
import { canHomologate } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";
import type { RequestStatus } from "@/lib/enums";

const statusMap: Record<string, RequestStatus> = {
  LIBERADO: "LIBERADO",
  LIBERADO_COM_RESTRICAO: "LIBERADO_COM_RESTRICAO",
  BLOQUEADO: "BLOQUEADO",
  PENDENTE: "AGUARDANDO_INSPECAO",
};

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await auth();
  if (!session?.user || !canHomologate(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { requestId } = await params;
  const body = await req.json();
  const parsed = inspectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  if (data.status === "BLOQUEADO" && !data.blockReason) {
    return NextResponse.json({ error: "Motivo de bloqueio obrigatório" }, { status: 400 });
  }

  // Regra de negócio: Termo de Responsabilidade (Anexo IV) é pré-requisito para liberar
  if (data.status.startsWith("LIBERADO")) {
    const term = await prisma.responsibilityTerm.findUnique({ where: { requestId } });
    if (!term?.accepted) {
      return NextResponse.json(
        { error: "Termo de Responsabilidade (Anexo IV) deve ser aceito/assinado antes da liberação." },
        { status: 400 }
      );
    }
  }

  const inspection = await prisma.technicalInspection.upsert({
    where: { requestId },
    update: {
      ...data,
      inspectorId: session.user.id,
      inspectedAt: new Date(),
    },
    create: {
      requestId,
      ...data,
      inspectorId: session.user.id,
      inspectedAt: new Date(),
    },
  });

  const requestStatus = statusMap[data.status] ?? "AGUARDANDO_INSPECAO";

  await prisma.equipmentRequest.update({
    where: { id: requestId },
    data: {
      status: requestStatus,
      restrictionNotes: data.restrictionNotes,
      blockReason: data.blockReason,
      releasedAt: data.status.startsWith("LIBERADO") ? new Date() : undefined,
      homologatedAt: new Date(),
      validUntil:
        data.status.startsWith("LIBERADO")
          ? new Date(Date.now() + 365 * 86400000)
          : undefined,
    },
  });

  const labelStatus =
    data.status === "LIBERADO"
      ? "LIBERADO"
      : data.status === "LIBERADO_COM_RESTRICAO"
        ? "LIBERADO_COM_RESTRICAO"
        : data.status === "BLOQUEADO"
          ? "BLOQUEADO"
          : "PENDENTE_ANALISE";

  await prisma.releaseStatus.upsert({
    where: { requestId },
    update: {
      labelStatus,
      restriction: data.restrictionNotes,
      blockReason: data.blockReason,
      technicalLead: session.user.name,
    },
    create: {
      requestId,
      labelStatus,
      technicalLead: session.user.name,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "INSPECTION_COMPLETED",
    entity: "TechnicalInspection",
    entityId: inspection.id,
    metadata: { status: data.status },
  });

  return NextResponse.json(inspection);
}
