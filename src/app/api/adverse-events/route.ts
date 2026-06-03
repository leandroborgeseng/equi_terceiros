import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  requestId: z.string(),
  description: z.string().min(10),
  severity: z.string().min(1),
  occurredAt: z.union([z.string(), z.date()]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const events = await prisma.adverseEvent.findMany({
    include: {
      request: { select: { protocol: true, equipmentName: true } },
      reportedBy: { select: { name: true } },
    },
    orderBy: { occurredAt: "desc" },
    take: 100,
  });

  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const event = await prisma.adverseEvent.create({
    data: {
      ...parsed.data,
      occurredAt: new Date(parsed.data.occurredAt),
      reportedById: session.user.id,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "ADVERSE_EVENT_REPORTED",
    entity: "AdverseEvent",
    entityId: event.id,
  });

  return NextResponse.json(event, { status: 201 });
}
