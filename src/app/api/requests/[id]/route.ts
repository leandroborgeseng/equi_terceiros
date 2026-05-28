import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { medicalRequestDraftSchema } from "@/lib/validators/request";
import { createAuditLog } from "@/lib/audit";

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
    const required = [
      "FRONTAL",
      "TRASEIRA",
      "ETIQUETA_FABRICANTE",
      "NUMERO_SERIE",
      "ACESSORIOS",
      "CABOS",
      "PLUGUE",
      "MONTADO",
    ];
    const missing = required.filter(
      (t) => !images.some((i) => i.photoType === t)
    );
    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Fotos obrigatórias incompletas", missing },
        { status: 400 }
      );
    }

    const request = await prisma.equipmentRequest.update({
      where: { id },
      data: {
        status: "DOCUMENTACAO_EM_ANALISE",
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
