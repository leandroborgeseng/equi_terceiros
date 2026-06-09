import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEMO_USER_EMAILS } from "@/lib/demo-users";
import { canImpersonate } from "@/lib/rbac";
import type { UserRole } from "@/lib/enums";
import { ALL_ROLES } from "@/lib/rbac";

const bodySchema = z.object({
  role: z.enum([
    "ADMIN",
    "ENGENHARIA_CLINICA",
    "MEDICO",
    "FORNECEDOR",
    "CENTRO_CIRURGICO",
    "CME_CCIH_NSP",
  ] as [UserRole, ...UserRole[]]),
});

function getRealRole(user: { role: UserRole; realRole?: UserRole }) {
  return user.realRole ?? user.role;
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !canImpersonate(getRealRole(session.user))) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { email: { in: Object.values(DEMO_USER_EMAILS) }, active: true },
    select: { id: true, email: true, name: true, role: true },
    orderBy: { name: "asc" },
  });

  const personas = ALL_ROLES.map((role) => {
    const user = users.find((u) => u.role === role);
    return {
      role,
      email: DEMO_USER_EMAILS[role],
      available: !!user,
      user: user ?? null,
    };
  });

  return NextResponse.json({
    impersonating: !!session.user.impersonating,
    currentRole: session.user.role,
    realRole: getRealRole(session.user),
    personas,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !canImpersonate(getRealRole(session.user))) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Perfil inválido" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAILS[parsed.data.role] },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!target || !target.role) {
    return NextResponse.json({ error: "Usuário demo não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: target.id,
      email: target.email,
      name: target.name,
      role: target.role as UserRole,
    },
  });
}
