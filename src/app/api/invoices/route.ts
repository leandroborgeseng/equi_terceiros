import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isClinicalEngineering } from "@/lib/rbac";
import { invoiceSchema } from "@/lib/validators/request";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user || !isClinicalEngineering(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      requests: {
        select: { id: true, equipmentName: true, serialNumber: true, status: true, internalOs: true },
      },
    },
  });

  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !isClinicalEngineering(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", ") || "Dados inválidos" },
      { status: 400 }
    );
  }

  const existing = await prisma.invoice.findUnique({ where: { number: parsed.data.number } });
  if (existing) {
    return NextResponse.json({ error: "Já existe uma NF com este número" }, { status: 409 });
  }

  const invoice = await prisma.invoice.create({
    data: { ...parsed.data, createdById: session.user.id },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "INVOICE_CREATED",
    entity: "Invoice",
    entityId: invoice.id,
    metadata: { number: invoice.number },
  });

  return NextResponse.json(invoice, { status: 201 });
}
