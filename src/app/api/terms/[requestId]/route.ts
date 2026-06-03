import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTermPdf } from "@/lib/pdf";
import { formatDate } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { requestId } = await params;
  const request = await prisma.equipmentRequest.findUnique({
    where: { id: requestId },
    include: { doctor: true, equipment: true },
  });

  if (!request) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const pdf = generateTermPdf({
    protocol: request.protocol,
    doctorName: request.doctor?.name ?? request.requesterName ?? "—",
    doctorCrm: request.doctorCrm,
    supplierName: request.supplierName,
    ownerName: request.ownerName,
    equipmentName: request.equipmentName,
    brand: request.brand,
    model: request.model,
    serialNumber: request.serialNumber,
    anvisaNumber: request.equipment?.anvisaNumber ?? undefined,
    plannedProcedure: request.plannedProcedure,
    plannedDate: formatDate(request.plannedDate),
  });

  await prisma.responsibilityTerm.upsert({
    where: { requestId },
    update: {},
    create: {
      requestId,
      generatedById: session.user.id,
    },
  });

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="termo-${request.protocol}.pdf"`,
    },
  });
}
