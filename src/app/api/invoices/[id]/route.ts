import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isClinicalEngineering } from "@/lib/rbac";
import { invoiceUpdateSchema } from "@/lib/validators/request";
import { createAuditLog } from "@/lib/audit";

async function assertEc() {
  const session = await auth();
  if (!session?.user || !isClinicalEngineering(session.user.role)) {
    return null;
  }
  return session;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await assertEc();
  if (!session) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = invoiceUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", ") || "Dados inválidos" },
      { status: 400 }
    );
  }

  const { linkRequestIds, unlinkRequestIds, ...invoiceData } = parsed.data;

  const current = await prisma.invoice.findUnique({
    where: { id },
    include: { requests: { select: { id: true } } },
  });
  if (!current) {
    return NextResponse.json({ error: "Nota fiscal não encontrada" }, { status: 404 });
  }

  const willHaveFile = !!(invoiceData.fileKey ?? current.fileKey);
  if ((linkRequestIds?.length ?? 0) > 0 && !willHaveFile) {
    return NextResponse.json(
      { error: "Anexe o arquivo da nota fiscal antes de vincular equipamentos" },
      { status: 400 }
    );
  }

  if (unlinkRequestIds?.length) {
    await prisma.equipmentRequest.updateMany({
      where: { id: { in: unlinkRequestIds }, invoiceId: id },
      data: { invoiceId: null },
    });
  }

  if (linkRequestIds?.length) {
    await prisma.equipmentRequest.updateMany({
      where: { id: { in: linkRequestIds } },
      data: { invoiceId: id },
    });
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: invoiceData,
    include: {
      requests: {
        select: { id: true, equipmentName: true, serialNumber: true, status: true, internalOs: true },
      },
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "INVOICE_UPDATED",
    entity: "Invoice",
    entityId: id,
    metadata: {
      number: invoice.number,
      file: !!(invoiceData.fileKey ?? current.fileKey),
      linked: linkRequestIds?.length ?? 0,
      unlinked: unlinkRequestIds?.length ?? 0,
    },
  });

  return NextResponse.json(invoice);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await assertEc();
  if (!session) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { _count: { select: { requests: true } } },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Nota fiscal não encontrada" }, { status: 404 });
  }
  if (invoice._count.requests > 0) {
    return NextResponse.json(
      { error: "Desvincule os equipamentos antes de excluir a nota fiscal" },
      { status: 400 }
    );
  }

  await prisma.invoice.delete({ where: { id } });

  await createAuditLog({
    userId: session.user.id,
    action: "INVOICE_DELETED",
    entity: "Invoice",
    entityId: id,
    metadata: { number: invoice.number },
  });

  return NextResponse.json({ ok: true });
}
