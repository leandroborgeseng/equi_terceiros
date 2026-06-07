import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTermPdf } from "@/lib/pdf";
import { formatDate } from "@/lib/utils";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const acceptSchema = z.object({
  accepted: z.boolean().optional(),
  signerName: z.string().optional(),
  signatureData: z.string().optional(),
  ecReviewed: z.boolean().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { requestId } = await params;
  const body = await req.json();
  const parsed = acceptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const data = parsed.data;
  if (data.accepted && !data.signerName) {
    return NextResponse.json(
      { error: "Informe o nome de quem aceita o termo" },
      { status: 400 }
    );
  }

  const term = await prisma.responsibilityTerm.upsert({
    where: { requestId },
    update: {
      accepted: data.accepted ?? undefined,
      signerName: data.signerName ?? undefined,
      signatureData: data.signatureData ?? undefined,
      signedAt: data.accepted ? new Date() : undefined,
      ecReviewed: data.ecReviewed ?? undefined,
      ecReviewerId: data.ecReviewed ? session.user.id : undefined,
    },
    create: {
      requestId,
      accepted: data.accepted ?? false,
      signerName: data.signerName,
      signatureData: data.signatureData,
      signedAt: data.accepted ? new Date() : undefined,
      ecReviewed: data.ecReviewed ?? false,
      ecReviewerId: data.ecReviewed ? session.user.id : undefined,
      generatedById: session.user.id,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "TERM_ACCEPTED",
    entity: "ResponsibilityTerm",
    entityId: term.id,
    metadata: { requestId, accepted: term.accepted, ecReviewed: term.ecReviewed },
  });

  return NextResponse.json(term);
}

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
