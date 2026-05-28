import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const alerts = await prisma.alert.findMany({
    where: { resolved: false },
    include: {
      equipment: { select: { name: true, serialNumber: true } },
      request: { select: { protocol: true, equipmentName: true } },
    },
    orderBy: [{ severity: "desc" }, { dueDate: "asc" }],
    take: 50,
  });

  return NextResponse.json(alerts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const alert = await prisma.alert.create({ data: body });
  return NextResponse.json(alert, { status: 201 });
}
