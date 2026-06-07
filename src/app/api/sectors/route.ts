import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isClinicalEngineering } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({ name: z.string().min(2, "Nome do setor obrigatório") });

// GET liberado para qualquer usuário autenticado (alimenta sugestões nos formulários)
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const sectors = await prisma.sector.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(sectors);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !isClinicalEngineering(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nome do setor obrigatório" }, { status: 400 });
  }

  const existing = await prisma.sector.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return NextResponse.json({ error: "Setor já cadastrado" }, { status: 409 });
  }

  const sector = await prisma.sector.create({ data: { name: parsed.data.name } });
  await createAuditLog({
    userId: session.user.id,
    action: "SECTOR_CREATED",
    entity: "Sector",
    entityId: sector.id,
    metadata: { name: sector.name },
  });
  return NextResponse.json(sector, { status: 201 });
}
