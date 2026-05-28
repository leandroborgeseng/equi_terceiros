import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDownloadPresignedUrl } from "@/lib/s3";

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

  const gallery = await Promise.all(
    images.map(async (img) => {
      const signed = await getDownloadPresignedUrl(img.storageKey);
      return {
        id: img.id,
        photoType: img.photoType,
        fileName: img.fileName,
        createdAt: img.createdAt,
        qualityScore: img.qualityScore,
        metadata: img.metadata,
        url: signed ?? `/api/files/local?key=${encodeURIComponent(img.storageKey)}`,
      };
    })
  );

  return NextResponse.json(gallery);
}
