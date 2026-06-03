import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isClinicalEngineering } from "@/lib/rbac";
import { processImageOcr } from "@/lib/ocr";
import { createAuditLog } from "@/lib/audit";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !isClinicalEngineering(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  const image = await prisma.equipmentImage.findUnique({ where: { id } });
  if (!image) return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 });

  const request = image.requestId
    ? await prisma.equipmentRequest.findUnique({
        where: { id: image.requestId },
        include: { equipment: true },
      })
    : null;

  const result = await processImageOcr({
    storageKey: image.storageKey,
    fileName: image.fileName,
    mimeType: image.mimeType,
    photoType: image.photoType,
    expectedSerial: request?.serialNumber,
    expectedBrand: request?.brand,
    expectedModel: request?.model,
    expectedAnvisa: request?.equipment?.anvisaNumber,
  });

  const metadata = await prisma.equipmentImageMetadata.upsert({
    where: { imageId: id },
    update: {
      imageType: result.imageType,
      extractedText: result.extractedText,
      serialDetected: result.serialDetected,
      manufacturerDetected: result.manufacturerDetected,
      modelDetected: result.modelDetected,
      aiValidationStatus: result.aiValidationStatus,
      processedAt: new Date(),
    },
    create: {
      imageId: id,
      imageType: result.imageType,
      extractedText: result.extractedText,
      serialDetected: result.serialDetected,
      manufacturerDetected: result.manufacturerDetected,
      modelDetected: result.modelDetected,
      aiValidationStatus: result.aiValidationStatus,
      processedAt: new Date(),
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "IMAGE_OCR_PROCESSED",
    entity: "EquipmentImageMetadata",
    entityId: metadata.id,
    metadata: { aiValidationStatus: result.aiValidationStatus, confidence: result.confidence },
  });

  return NextResponse.json({ metadata, result });
}
