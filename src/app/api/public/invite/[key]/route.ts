import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const invite = await prisma.accessInvite.findUnique({ where: { key } });

  if (!invite) {
    return NextResponse.json({ error: "Chave inválida" }, { status: 404 });
  }
  if (invite.revokedAt) {
    return NextResponse.json({ error: "Chave revogada" }, { status: 410 });
  }
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Chave expirada" }, { status: 410 });
  }

  return NextResponse.json({
    valid: true,
    requesterName: invite.requesterName,
    requesterEmail: invite.requesterEmail,
    requesterPhone: invite.requesterPhone,
    doctorCrm: invite.doctorCrm,
    entryType: invite.entryType,
  });
}
