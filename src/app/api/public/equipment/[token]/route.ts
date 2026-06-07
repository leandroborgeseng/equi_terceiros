import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Consulta pública (sem login) do cadastro do equipamento via QR Code.
// Não expõe dados de paciente (LGPD) — apenas dados do equipamento e status.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const request = await prisma.equipmentRequest.findUnique({
    where: { qrToken: token },
    include: {
      releaseStatus: true,
      technicalInspection: { select: { restrictionNotes: true, blockReason: true, inspectedAt: true } },
      invoice: { select: { number: true } },
    },
  });

  if (!request) return NextResponse.json({ error: "Equipamento não encontrado" }, { status: 404 });

  return NextResponse.json({
    protocol: request.protocol,
    internalOs: request.internalOs,
    status: request.status,
    equipmentClass: request.equipmentClass,
    equipmentName: request.equipmentName,
    brand: request.brand,
    model: request.model,
    serialNumber: request.serialNumber,
    entryType: request.entryType,
    usageSector: request.usageSector,
    destinationSector: request.destinationSector,
    supplierName: request.supplierName,
    ownerName: request.ownerName,
    invoiceNumber: request.invoice?.number ?? null,
    entryDate: request.entryDate,
    plannedDate: request.plannedDate,
    validUntil: request.validUntil,
    restrictionNotes: request.restrictionNotes ?? request.technicalInspection?.restrictionNotes ?? null,
    blockReason: request.blockReason ?? request.technicalInspection?.blockReason ?? null,
    technicalLead: request.releaseStatus?.technicalLead ?? null,
    inspectedAt: request.technicalInspection?.inspectedAt ?? null,
  });
}
