import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildFileUrl } from "@/lib/file-storage";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { requestId } = await params;

  const images = await prisma.equipmentImage.findMany({
    where: { requestId },
    include: { metadata: true },
    orderBy: { createdAt: "asc" },
  });

  const gallery = images.map((img) => ({
    id: img.id,
    photoType: img.photoType,
    fileName: img.fileName,
    createdAt: img.createdAt,
    qualityScore: img.qualityScore,
    metadata: img.metadata,
    url: buildFileUrl(img.storageKey),
  }));

  return NextResponse.json(gallery);
}
