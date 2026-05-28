import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { medicalRequestSchema } from "@/lib/validators/request";
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

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!canCreateRequest(session.user.role)) {
    return NextResponse.json({ error: "Perfil sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = medicalRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const protocol = generateProtocol();
  const supplierToken = generateSupplierToken();

  const request = await prisma.equipmentRequest.create({
    data: {
      ...data,
      protocol,
      supplierToken,
      doctorId: session.user.id,
      status: "AGUARDANDO_DOCUMENTACAO",
      wizardStep: 5,
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
    metadata: { protocol },
  });

  return NextResponse.json(request, { status: 201 });
}
