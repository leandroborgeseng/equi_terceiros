import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  equipmentId: z.string(),
  withdrawnBy: z.string().min(2),
  reason: z.string().optional(),
  completed: z.boolean().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id: requestId } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const record = await prisma.withdrawalRecord.create({
    data: {
      equipmentId: parsed.data.equipmentId,
      withdrawnAt: new Date(),
      withdrawnBy: parsed.data.withdrawnBy,
      reason: parsed.data.reason,
      completed: parsed.data.completed ?? false,
    },
  });

  await prisma.equipmentRequest.update({
    where: { id: requestId },
    data: {
      status: parsed.data.completed ? "RETIRADO" : "AGUARDANDO_RETIRADA",
      withdrawnAt: parsed.data.completed ? new Date() : undefined,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "EQUIPMENT_WITHDRAWN",
    entity: "WithdrawalRecord",
    entityId: record.id,
    metadata: { requestId },
  });

  return NextResponse.json(record, { status: 201 });
}
