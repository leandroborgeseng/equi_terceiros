import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLabelsA4Pdf, type LabelPdfData } from "@/lib/pdf";
import { formatDate } from "@/lib/utils";
import { canHomologate } from "@/lib/rbac";
import { randomUUID } from "crypto";
import QRCode from "qrcode";

const batchSchema = z.object({
  requestIds: z.array(z.string().min(1)).min(1, "Selecione ao menos um equipamento").max(50),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !canHomologate(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = batchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors.requestIds?.[0] ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const requests = await prisma.equipmentRequest.findMany({
    where: { id: { in: parsed.data.requestIds } },
    include: { releaseStatus: true },
    orderBy: { protocol: "asc" },
  });

  if (requests.length === 0) {
    return NextResponse.json({ error: "Nenhum equipamento encontrado" }, { status: 404 });
  }

  const baseUrl =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? new URL(req.url).origin;
  const today = formatDate(new Date());

  const labels: LabelPdfData[] = [];

  for (const request of requests) {
    let qrToken = request.qrToken;
    if (!qrToken) {
      const updated = await prisma.equipmentRequest.update({
        where: { id: request.id },
        data: { qrToken: randomUUID() },
      });
      qrToken = updated.qrToken;
    }

    const consultUrl = `${baseUrl}/equipamento/${qrToken}`;
    const qrDataUrl = await QRCode.toDataURL(consultUrl, {
      margin: 0,
      width: 240,
      errorCorrectionLevel: "M",
    });

    labels.push({
      protocol: request.internalOs ?? request.protocol,
      status: request.releaseStatus?.labelStatus ?? "PENDENTE_ANALISE",
      date: today,
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
  }

  const pdf = generateLabelsA4Pdf(labels);

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="etiquetas-a4-${labels.length}.pdf"`,
    },
  });
}
