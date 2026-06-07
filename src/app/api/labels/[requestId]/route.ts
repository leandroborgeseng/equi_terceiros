import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLabelPdf } from "@/lib/pdf";
import { formatDate } from "@/lib/utils";
import { canHomologate } from "@/lib/rbac";
import { randomUUID } from "crypto";
import QRCode from "qrcode";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await auth();
  if (!session?.user || !canHomologate(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { requestId } = await params;
  let request = await prisma.equipmentRequest.findUnique({
    where: { id: requestId },
    include: { releaseStatus: true },
  });

  if (!request) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  // Garante um token de QR (cadastros antigos podem não ter)
  if (!request.qrToken) {
    request = await prisma.equipmentRequest.update({
      where: { id: requestId },
      data: { qrToken: randomUUID() },
      include: { releaseStatus: true },
    });
  }

  // URL pública de consulta do equipamento (apontada pelo QR Code)
  const baseUrl =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? new URL(req.url).origin;
  const consultUrl = `${baseUrl}/equipamento/${request.qrToken}`;
  const qrDataUrl = await QRCode.toDataURL(consultUrl, {
    margin: 0,
    width: 240,
    errorCorrectionLevel: "M",
  });

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
    qrDataUrl,
  });

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="etiqueta-${request.protocol}.pdf"`,
    },
  });
}
