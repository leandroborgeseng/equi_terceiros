import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  medicalRequestDraftSchema,
  REQUIRED_DOCUMENT_TYPES,
  REQUIRED_PHOTOS,
  DELETABLE_STATUSES,
} from "@/lib/validators/request";
import { createAuditLog } from "@/lib/audit";
import { isClinicalEngineering } from "@/lib/rbac";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const request = await prisma.equipmentRequest.findUnique({
    where: { id },
    include: {
      doctor: { select: { id: true, name: true, email: true, crm: true } },
      supplier: true,
      attachments: { orderBy: { createdAt: "desc" } },
      documentChecklist: true,
      technicalInspection: { include: { inspector: { select: { name: true } } } },
      releaseStatus: true,
      responsibilityTerm: true,
      accessInvite: { select: { key: true, requesterName: true } },
      equipment: { include: { images: { include: { metadata: true } } } },
    },
  });

  if (!request) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  if (session.user.role === "MEDICO" && request.doctorId !== session.user.id) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  return NextResponse.json(request);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.equipmentRequest.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  if (session.user.role === "MEDICO" && existing.doctorId !== session.user.id) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  if (body.wizardStep !== undefined || body.status === "RASCUNHO") {
    const parsed = medicalRequestDraftSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const request = await prisma.equipmentRequest.update({
      where: { id },
      data: {
        ...parsed.data,
        wizardStep: body.wizardStep ?? existing.wizardStep,
        status: body.status ?? existing.status,
      },
    });
    return NextResponse.json(request);
  }

  if (body.action === "submit") {
    const images = await prisma.equipmentImage.findMany({
      where: { requestId: id },
    });
    const missingPhotos = REQUIRED_PHOTOS.filter(
      (t) => !images.some((i) => i.photoType === t)
    );
    if (missingPhotos.length > 0) {
      return NextResponse.json(
        { error: "Fotos obrigatórias incompletas", missing: missingPhotos },
        { status: 400 }
      );
    }

    const attachments = await prisma.attachment.findMany({ where: { requestId: id } });
    const missingDocs = REQUIRED_DOCUMENT_TYPES.filter(
      (t) => !attachments.some((a) => a.type === t)
    );
    if (missingDocs.length > 0) {
      return NextResponse.json(
        { error: "Documentação obrigatória incompleta", missing: missingDocs },
        { status: 400 }
      );
    }

    const request = await prisma.equipmentRequest.update({
      where: { id },
      data: {
        status: "AGUARDANDO_CADASTRO",
        submittedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "REQUEST_SUBMITTED",
      entity: "EquipmentRequest",
      entityId: id,
    });

    return NextResponse.json(request);
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !isClinicalEngineering(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.equipmentRequest.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  if (!DELETABLE_STATUSES.includes(existing.status as (typeof DELETABLE_STATUSES)[number])) {
    return NextResponse.json(
      {
        error:
          "Só é possível excluir cadastros não validados (antes da liberação/bloqueio). Equipamentos já avaliados são mantidos para auditoria.",
      },
      { status: 400 }
    );
  }

  // Remove dependências sem cascade automático
  await prisma.alert.deleteMany({ where: { requestId: id } });
  await prisma.equipmentImage.deleteMany({ where: { requestId: id } });
  await prisma.equipmentRequest.delete({ where: { id } });

  await createAuditLog({
    userId: session.user.id,
    action: "REQUEST_DELETED",
    entity: "EquipmentRequest",
    entityId: id,
    metadata: { protocol: existing.protocol, status: existing.status, public: existing.submittedViaPublic },
  });

  return NextResponse.json({ ok: true });
}
