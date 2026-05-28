import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checklistUpdateSchema } from "@/lib/validators/request";
import { canHomologate } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";

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
  const hasRejection = Object.values(data).includes("REPROVADO");

  if (hasRejection && !data.rejectionReason) {
    return NextResponse.json(
      { error: "Motivo obrigatório ao reprovar item" },
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

  const requestStatus = hasRejection
    ? "PENDENTE_COMPLEMENTO"
    : "AGUARDANDO_INSPECAO";

  await prisma.equipmentRequest.update({
    where: { id: requestId },
    data: { status: requestStatus },
  });

  await createAuditLog({
    userId: session.user.id,
    action: hasRejection ? "CHECKLIST_REJECTED" : "CHECKLIST_APPROVED",
    entity: "DocumentChecklist",
    entityId: checklist.id,
    metadata: data,
  });

  return NextResponse.json(checklist);
}
