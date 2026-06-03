import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  equipmentId: z.string(),
  location: z.string().min(2),
  notes: z.string().optional(),
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

  const record = await prisma.storageRecord.create({
    data: {
      equipmentId: parsed.data.equipmentId,
      location: parsed.data.location,
      storedAt: new Date(),
      notes: parsed.data.notes,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "EQUIPMENT_STORED",
    entity: "StorageRecord",
    entityId: record.id,
    metadata: { requestId },
  });

  return NextResponse.json(record, { status: 201 });
}
