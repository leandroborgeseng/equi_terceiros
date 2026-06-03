import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { validateUpload } from "@/lib/document-validation";
import type { DocumentType, RequiredPhotoType } from "@/lib/enums";

const photoTypes = new Set([
  "FRONTAL",
  "TRASEIRA",
  "ETIQUETA_FABRICANTE",
  "NUMERO_SERIE",
  "ACESSORIOS",
  "CABOS",
  "PLUGUE",
  "MONTADO",
]);

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json();
  const {
    requestId,
    type,
    photoType,
    fileName,
    mimeType,
    sizeBytes,
    storageKey,
    qualityScore,
  } = body;

  if (!requestId || !storageKey || !fileName) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const request = await prisma.equipmentRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 });

  const validation = validateUpload({
    requestSerialNumber: request.serialNumber,
    requestBrand: request.brand,
    requestModel: request.model,
    documentType: type,
    fileName,
    mimeType: mimeType ?? "",
    photoType,
  });

  if (photoType && photoTypes.has(photoType)) {
    const image = await prisma.equipmentImage.create({
      data: {
        requestId,
        photoType: photoType as RequiredPhotoType,
        storageKey,
        fileName,
        mimeType: mimeType ?? "image/jpeg",
        sizeBytes: sizeBytes ?? 0,
        qualityScore,
        uploadedBy: session?.user?.id,
        metadata: {
          create: {
            imageType: photoType,
            aiValidationStatus: validation.status,
            extractedText: validation.extractedText,
            serialDetected: validation.serialDetected,
            manufacturerDetected: validation.manufacturerDetected,
            modelDetected: validation.modelDetected,
          },
        },
      },
    });

    await createAuditLog({
      userId: session?.user?.id,
      action: "PHOTO_UPLOADED",
      entity: "EquipmentImage",
      entityId: image.id,
      metadata: { photoType, validation: validation.messages },
    });

    return NextResponse.json({ ...image, validation });
  }

  const attachment = await prisma.attachment.create({
    data: {
      requestId,
      type: (type as DocumentType) ?? "OUTROS",
      fileName,
      mimeType: mimeType ?? "application/octet-stream",
      sizeBytes: sizeBytes ?? 0,
      storageKey,
      uploadedBy: session?.user?.id,
    },
  });

  await createAuditLog({
    userId: session?.user?.id,
    action: "ATTACHMENT_UPLOADED",
    entity: "Attachment",
    entityId: attachment.id,
    metadata: { type, validation: validation.messages },
  });

  return NextResponse.json({ ...attachment, validation });
}
