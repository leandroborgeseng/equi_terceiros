import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isValidStorageKey, readStoredFile } from "@/lib/file-storage";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const key = new URL(req.url).searchParams.get("key");
  if (!key || !isValidStorageKey(key)) {
    return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
  }

  const [image, attachment, invoice] = await Promise.all([
    prisma.equipmentImage.findFirst({ where: { storageKey: key }, select: { fileName: true, mimeType: true } }),
    prisma.attachment.findFirst({ where: { storageKey: key }, select: { fileName: true, mimeType: true } }),
    prisma.invoice.findFirst({ where: { fileKey: key }, select: { fileName: true } }),
  ]);

  const fileName = image?.fileName ?? attachment?.fileName ?? invoice?.fileName ?? key;
  const mimeHint = image?.mimeType ?? attachment?.mimeType;

  const file = await readStoredFile(key, fileName);
  if (!file) {
    return NextResponse.json({ error: "Arquivo não encontrado no storage" }, { status: 404 });
  }

  const mimeType = mimeHint ?? file.mimeType;

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `inline; filename="${fileName.replace(/"/g, "")}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
