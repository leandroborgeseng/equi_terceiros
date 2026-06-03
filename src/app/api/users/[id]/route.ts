import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";
import bcrypt from "bcryptjs";
import { z } from "zod";

const patchSchema = z.object({
  role: z
    .enum(["ADMIN", "ENGENHARIA_CLINICA", "MEDICO", "FORNECEDOR", "CENTRO_CIRURGICO", "CME_CCIH_NSP"])
    .optional(),
  active: z.boolean().optional(),
  name: z.string().min(2).optional(),
  crm: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(6).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !canManageUsers(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Evita o admin desativar a própria conta e ficar sem acesso
  if (parsed.data.active === false && id === session.user.id) {
    return NextResponse.json({ error: "Não é possível desativar a própria conta" }, { status: 400 });
  }

  const { password, ...rest } = parsed.data;
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...rest,
      ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
    },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "USER_UPDATED",
    entity: "User",
    entityId: id,
    metadata: { ...rest, passwordReset: !!password },
  });

  return NextResponse.json(user);
}
