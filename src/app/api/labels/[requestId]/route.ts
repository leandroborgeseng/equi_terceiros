import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLabelPdf } from "@/lib/pdf";
import { formatDate } from "@/lib/utils";
import { canHomologate } from "@/lib/rbac";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await auth();
  if (!session?.user || !canHomologate(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { requestId } = await params;
  const request = await prisma.equipmentRequest.findUnique({
    where: { id: requestId },
    include: { releaseStatus: true },
  });

  if (!request) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const labelStatus = request.releaseStatus?.labelStatus ?? "PENDENTE_ANALISE";
  const pdf = generateLabelPdf({
    protocol: request.internalOs ?? request.protocol,
    status: labelStatus,
    date: formatDate(new Date()),
    validUntil: request.validUntil ? formatDate(request.validUntil) : undefined,
    sector: request.usageSector,
    restriction: request.restrictionNotes ?? undefined,
    blockReason: request.blockReason ?? undefined,
    technicalLead: request.releaseStatus?.technicalLead ?? session.user.name,
    equipmentName: request.equipmentName,
    brand: request.brand,
    model: request.model,
    serialNumber: request.serialNumber,
  });

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="etiqueta-${request.protocol}.pdf"`,
    },
  });
}
