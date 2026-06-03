import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checklistUpdateSchema } from "@/lib/validators/request";
import { canHomologate } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";
import { notifyRequestRejection } from "@/lib/notifications";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await auth();
  if (!session?.user || !canHomologate(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { requestId } = await params;
  const body = await req.json();
  const parsed = checklistUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const isReproved = data.docStatus === "REPROVADO";
  const isPending = data.docStatus === "PENDENTE";

  if (isReproved && !data.rejectionReason) {
    return NextResponse.json(
      { error: "Motivo obrigatório ao reprovar a documentação" },
      { status: 400 }
    );
  }

  const checklist = await prisma.documentChecklist.upsert({
    where: { requestId },
    update: {
      ...data,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    },
    create: {
      requestId,
      ...data,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    },
  });

  // Aprovado → AGUARDANDO_INSPECAO; Pendente → PENDENTE_DOCUMENTOS; Reprovado → BLOQUEADO
  const requestStatus = isReproved
    ? "BLOQUEADO"
    : isPending
      ? "PENDENTE_DOCUMENTOS"
      : data.docStatus === "APROVADO"
        ? "AGUARDANDO_INSPECAO"
        : undefined;

  const request = requestStatus
    ? await prisma.equipmentRequest.update({
        where: { id: requestId },
        data: { status: requestStatus },
      })
    : await prisma.equipmentRequest.findUniqueOrThrow({ where: { id: requestId } });

  if ((isReproved || isPending) && data.rejectionReason) {
    await notifyRequestRejection({
      requestId,
      protocol: request.protocol,
      doctorId: request.doctorId,
      reason: data.rejectionReason,
    });
  }

  await createAuditLog({
    userId: session.user.id,
    action: isReproved ? "CHECKLIST_REJECTED" : "CHECKLIST_REVIEWED",
    entity: "DocumentChecklist",
    entityId: checklist.id,
    metadata: { docStatus: data.docStatus },
  });

  return NextResponse.json(checklist);
}
