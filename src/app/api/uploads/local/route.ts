import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isValidStorageKey, saveLocalFile } from "@/lib/file-storage";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const storageKey = req.headers.get("x-storage-key");
  if (!storageKey || !isValidStorageKey(storageKey)) {
    return NextResponse.json({ error: "Chave de armazenamento inválida" }, { status: 400 });
  }

  const body = await req.arrayBuffer();
  if (!body.byteLength) {
    return NextResponse.json({ error: "Arquivo vazio" }, { status: 400 });
  }

  try {
    await saveLocalFile(storageKey, Buffer.from(body));
    return NextResponse.json({ ok: true, storageKey });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao salvar arquivo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
