import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageInvites } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";
import { randomBytes } from "crypto";

const inviteSchema = z.object({
  requesterName: z.string().min(3, "Nome obrigatório"),
  requesterEmail: z.string().email("E-mail inválido"),
  requesterPhone: z.string().optional(),
  doctorCrm: z.string().optional(),
  entryType: z
    .enum(["MEDICO", "FORNECEDOR", "COMODATO", "ALUGUEL", "DEMONSTRACAO", "OUTRO"])
    .default("MEDICO"),
  note: z.string().optional(),
});

function generateKey() {
  return randomBytes(9).toString("base64url").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !canManageInvites(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const invites = await prisma.accessInvite.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { requests: true } } },
  });

  return NextResponse.json(
    invites.map((i) => ({
      id: i.id,
      key: i.key,
      requesterName: i.requesterName,
      requesterEmail: i.requesterEmail,
      requesterPhone: i.requesterPhone,
      doctorCrm: i.doctorCrm,
      entryType: i.entryType,
      note: i.note,
      expiresAt: i.expiresAt,
      revokedAt: i.revokedAt,
      createdAt: i.createdAt,
      usageCount: i._count.requests,
      expired: i.expiresAt ? new Date(i.expiresAt) < new Date() : false,
    }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !canManageInvites(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", ") || "Dados inválidos" },
      { status: 400 }
    );
  }

  const invite = await prisma.accessInvite.create({
    data: {
      key: generateKey(),
      ...parsed.data,
      createdById: session.user.id,
      expiresAt: new Date(Date.now() + 30 * 86400000), // 30 dias
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "INVITE_CREATED",
    entity: "AccessInvite",
    entityId: invite.id,
    metadata: { key: invite.key, requester: invite.requesterName },
  });

  return NextResponse.json(invite, { status: 201 });
}
