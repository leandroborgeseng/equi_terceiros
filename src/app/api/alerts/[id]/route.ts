import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const resolved = body.resolved !== false;

  const alert = await prisma.alert.update({
    where: { id },
    data: { resolved, resolvedAt: resolved ? new Date() : null },
  });

  await createAuditLog({
    userId: session.user.id,
    action: resolved ? "ALERT_RESOLVED" : "ALERT_REOPENED",
    entity: "Alert",
    entityId: id,
  });

  return NextResponse.json(alert);
}
