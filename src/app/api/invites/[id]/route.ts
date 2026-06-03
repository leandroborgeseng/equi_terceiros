import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageInvites } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !canManageInvites(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const revoke = body.revoke !== false; // default: revogar

  const invite = await prisma.accessInvite.update({
    where: { id },
    data: { revokedAt: revoke ? new Date() : null },
  });

  await createAuditLog({
    userId: session.user.id,
    action: revoke ? "INVITE_REVOKED" : "INVITE_REACTIVATED",
    entity: "AccessInvite",
    entityId: id,
    metadata: { key: invite.key },
  });

  return NextResponse.json(invite);
}
