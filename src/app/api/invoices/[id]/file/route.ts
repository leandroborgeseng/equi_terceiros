import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isClinicalEngineering } from "@/lib/rbac";
import { getDownloadPresignedUrl } from "@/lib/s3";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !isClinicalEngineering(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice?.fileKey) {
    return NextResponse.json({ error: "Nota fiscal sem anexo" }, { status: 404 });
  }

  const signed = await getDownloadPresignedUrl(invoice.fileKey);
  const url = signed ?? `/api/files/local?key=${encodeURIComponent(invoice.fileKey)}`;

  return NextResponse.json({
    url,
    fileName: invoice.fileName,
    fileKey: invoice.fileKey,
  });
}
