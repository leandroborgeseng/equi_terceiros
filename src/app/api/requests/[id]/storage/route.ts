import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isClinicalEngineering } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  location: z.string().min(2, "Informe o local de armazenamento"),
  notes: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !isClinicalEngineering(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id: requestId } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", ") || "Dados inválidos" },
      { status: 400 }
    );
  }

  const request = await prisma.equipmentRequest.findUnique({ where: { id: requestId } });
  if (!request) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const record = await prisma.storageRecord.create({
    data: {
      requestId,
      equipmentId: request.equipmentId ?? undefined,
      location: parsed.data.location,
      storedAt: new Date(),
      storedBy: session.user.name,
      notes: parsed.data.notes,
    },
  });

  // mantém o local atual no cadastro do equipamento
  await prisma.equipmentRequest.update({
    where: { id: requestId },
    data: { storageLocation: parsed.data.location },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "EQUIPMENT_STORED",
    entity: "StorageRecord",
    entityId: record.id,
    metadata: { requestId, location: parsed.data.location },
  });

  return NextResponse.json(record, { status: 201 });
}
