"use client";

/**
 * Faz upload de um arquivo (documento ou foto) vinculado a uma solicitação,
 * usando o mesmo fluxo presign + confirm do MobileUpload.
 * Retorna o storageKey do anexo criado.
 */
export async function uploadAttachment(params: {
  requestId: string;
  type: string;
  file: File | Blob;
  fileName: string;
  photoType?: string;
}): Promise<{ storageKey: string }> {
  const { requestId, type, file, fileName, photoType } = params;
  const mimeType = (file as File).type || "application/octet-stream";
  const sizeBytes = file.size;

  const presignRes = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId, type, photoType, fileName, mimeType, sizeBytes }),
  });
  if (!presignRes.ok) throw new Error("Falha ao preparar upload");
  const { uploadUrl, storageKey, useLocal } = await presignRes.json();

  if (uploadUrl && !useLocal) {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": mimeType },
    });
  }

  const confirmRes = await fetch("/api/uploads/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId, type, photoType, fileName, mimeType, sizeBytes, storageKey }),
  });
  if (!confirmRes.ok) throw new Error("Falha ao confirmar upload");

  return { storageKey };
}
