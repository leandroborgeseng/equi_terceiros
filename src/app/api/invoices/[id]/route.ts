import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isClinicalEngineering } from "@/lib/rbac";
import { invoiceUpdateSchema } from "@/lib/validators/request";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !isClinicalEngineering(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = invoiceUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", ") || "Dados inválidos" },
      { status: 400 }
    );
  }

  const invoice = await prisma.invoice.update({ where: { id }, data: parsed.data });

  await createAuditLog({
    userId: session.user.id,
    action: "INVOICE_UPDATED",
    entity: "Invoice",
    entityId: id,
    metadata: { number: invoice.number, file: !!parsed.data.fileKey },
  });

  return NextResponse.json(invoice);
}
