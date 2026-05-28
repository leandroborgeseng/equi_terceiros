import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { medicalRequestDraftSchema, REQUEST_DRAFT_DEFAULTS } from "@/lib/validators/request";
import { generateProtocol, generateSupplierToken } from "@/lib/utils";
import { createAuditLog } from "@/lib/audit";
import { canCreateRequest } from "@/lib/rbac";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const queue = searchParams.get("queue");

  const where: Record<string, unknown> = {};

  if (session.user.role === "MEDICO") {
    where.doctorId = session.user.id;
  }

  if (status) where.status = status;

  if (queue === "engenharia") {
    where.status = {
      in: [
        "DOCUMENTACAO_EM_ANALISE",
        "PENDENTE_COMPLEMENTO",
        "AGUARDANDO_INSPECAO",
        "AGUARDANDO_DOCUMENTACAO",
        "URGENCIA",
        "VENCIDO",
        "BLOQUEADO",
        "LIBERADO",
        "LIBERADO_COM_RESTRICAO",
      ],
    };
  }

  const requests = await prisma.equipmentRequest.findMany({
    where,
    include: {
      doctor: { select: { id: true, name: true, email: true } },
      supplier: true,
      documentChecklist: true,
      technicalInspection: true,
      releaseStatus: true,
      _count: { select: { attachments: true } },
    },
    orderBy: [{ isUrgent: "desc" }, { plannedDate: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(requests);
}

function mergeDraft(body: Record<string, unknown>) {
  const parsed = medicalRequestDraftSchema.safeParse(body);
  if (!parsed.success) {
    return { error: parsed.error.flatten() } as const;
  }

  const merged = {
    ...REQUEST_DRAFT_DEFAULTS,
    ...parsed.data,
    requestDate: parsed.data.requestDate ?? REQUEST_DRAFT_DEFAULTS.requestDate,
    plannedDate: parsed.data.plannedDate ?? REQUEST_DRAFT_DEFAULTS.plannedDate,
    patientName: "—",
    medicalRecord: "—",
  };

  return { data: merged } as const;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!canCreateRequest(session.user.role)) {
    return NextResponse.json({ error: "Perfil sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const merged = mergeDraft(body);
  if ("error" in merged) {
    return NextResponse.json({ error: merged.error }, { status: 400 });
  }

  const protocol = generateProtocol();
  const supplierToken = generateSupplierToken();
  const isDraft = body.status === "RASCUNHO";

  const request = await prisma.equipmentRequest.create({
    data: {
      ...merged.data,
      protocol,
      supplierToken,
      doctorId: session.user.id,
      status: isDraft ? "RASCUNHO" : "AGUARDANDO_DOCUMENTACAO",
      wizardStep: typeof body.wizardStep === "number" ? body.wizardStep : 1,
      documentChecklist: { create: {} },
      releaseStatus: { create: {} },
    },
    include: { doctor: true },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "REQUEST_CREATED",
    entity: "EquipmentRequest",
    entityId: request.id,
    metadata: { protocol, draft: isDraft },
  });

  return NextResponse.json(request, { status: 201 });
}
