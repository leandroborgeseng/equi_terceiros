import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isClinicalEngineering } from "@/lib/rbac";
import { buildFileUrl } from "@/lib/file-storage";

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

  return NextResponse.json({
    url: buildFileUrl(invoice.fileKey),
    fileName: invoice.fileName,
    fileKey: invoice.fileKey,
  });
}
