import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isClinicalEngineering } from "@/lib/rbac";
import { supplierSchema } from "@/lib/validators/request";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user || !isClinicalEngineering(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { equipmentRequests: true } } },
  });

  return NextResponse.json(
    suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      cnpj: s.cnpj,
      email: s.email,
      phone: s.phone,
      address: s.address,
      requestsCount: s._count.equipmentRequests,
      createdAt: s.createdAt,
    }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !isClinicalEngineering(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = supplierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", ") || "Dados inválidos" },
      { status: 400 }
    );
  }

  const supplier = await prisma.supplier.create({ data: parsed.data });

  await createAuditLog({
    userId: session.user.id,
    action: "SUPPLIER_CREATED",
    entity: "Supplier",
    entityId: supplier.id,
    metadata: { name: supplier.name },
  });

  return NextResponse.json(supplier, { status: 201 });
}
