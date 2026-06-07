import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isClinicalEngineering } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["EM_USO", "AGUARDANDO_RETIRADA", "RETIRADO"]),
  withdrawnBy: z.string().optional(),
  reason: z.string().optional(),
});

// Transições permitidas a partir do status atual
const ALLOWED: Record<string, string[]> = {
  LIBERADO: ["EM_USO", "AGUARDANDO_RETIRADA", "RETIRADO"],
  LIBERADO_COM_RESTRICAO: ["EM_USO", "AGUARDANDO_RETIRADA", "RETIRADO"],
  EM_USO: ["AGUARDANDO_RETIRADA", "RETIRADO"],
  AGUARDANDO_RETIRADA: ["RETIRADO", "EM_USO"],
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !isClinicalEngineering(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const request = await prisma.equipmentRequest.findUnique({ where: { id } });
  if (!request) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const { action } = parsed.data;
  if (!ALLOWED[request.status]?.includes(action)) {
    return NextResponse.json(
      { error: `Transição inválida a partir de "${request.status}"` },
      { status: 400 }
    );
  }

  if (action === "RETIRADO" && !parsed.data.withdrawnBy) {
    return NextResponse.json({ error: "Informe quem retirou o equipamento" }, { status: 400 });
  }

  await prisma.equipmentRequest.update({
    where: { id },
    data: {
      status: action,
      inUseAt: action === "EM_USO" ? new Date() : undefined,
      withdrawnAt: action === "RETIRADO" ? new Date() : undefined,
    },
  });

  if (action === "RETIRADO" || action === "AGUARDANDO_RETIRADA") {
    await prisma.withdrawalRecord.create({
      data: {
        requestId: id,
        equipmentId: request.equipmentId ?? undefined,
        withdrawnAt: new Date(),
        withdrawnBy: parsed.data.withdrawnBy ?? session.user.name ?? "—",
        reason: parsed.data.reason,
        completed: action === "RETIRADO",
      },
    });
  }

  await createAuditLog({
    userId: session.user.id,
    action: `LIFECYCLE_${action}`,
    entity: "EquipmentRequest",
    entityId: id,
    metadata: { from: request.status, to: action },
  });

  return NextResponse.json({ ok: true, status: action });
}
