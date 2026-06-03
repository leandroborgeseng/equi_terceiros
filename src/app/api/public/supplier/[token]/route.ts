import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const request = await prisma.equipmentRequest.findUnique({
    where: { supplierToken: token },
    include: {
      doctor: { select: { name: true, crm: true } },
      attachments: true,
    },
  });

  if (!request) return NextResponse.json({ error: "Link inválido" }, { status: 404 });

  return NextResponse.json({
    id: request.id,
    protocol: request.protocol,
    status: request.status,
    equipmentName: request.equipmentName,
    brand: request.brand,
    model: request.model,
    serialNumber: request.serialNumber,
    doctor: request.doctor,
    requesterName: request.requesterName,
    doctorCrm: request.doctorCrm,
    plannedDate: request.plannedDate,
    plannedProcedure: request.plannedProcedure,
    attachmentsCount: request.attachments.length,
  });
}
