import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isClinicalEngineering } from "@/lib/rbac";
import { deleteStoredFile } from "@/lib/file-storage";
import { createAuditLog } from "@/lib/audit";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !isClinicalEngineering(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  const image = await prisma.equipmentImage.findUnique({ where: { id } });
  if (!image) {
    return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 });
  }

  await prisma.equipmentImage.delete({ where: { id } });
  await deleteStoredFile(image.storageKey);

  await createAuditLog({
    userId: session.user.id,
    action: "PHOTO_DELETED",
    entity: "EquipmentImage",
    entityId: id,
    metadata: {
      requestId: image.requestId,
      photoType: image.photoType,
      fileName: image.fileName,
    },
  });

  return NextResponse.json({ ok: true });
}
