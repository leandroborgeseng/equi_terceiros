import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildStorageKey, getUploadPresignedUrl } from "@/lib/s3";

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json();
  const { requestId, type, fileName, mimeType } = body;

  if (!requestId || !type || !fileName) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const storageKey = buildStorageKey({ requestId, type, fileName });
  const result = await getUploadPresignedUrl({
    key: storageKey,
    contentType: mimeType ?? "application/octet-stream",
  });

  return NextResponse.json({
    storageKey,
    uploadUrl: result.url,
    useLocal: result.useLocal ?? !result.url,
    uploadedBy: session?.user?.id,
  });
}
