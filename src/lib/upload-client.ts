"use client";

/**
 * Presign + PUT do arquivo no storage. `scopeId` define o prefixo da chave
 * (id da solicitação ou da nota fiscal). Não cria registro no banco.
 */
export async function presignAndUpload(params: {
  scopeId: string;
  type: string;
  file: File | Blob;
  fileName: string;
  photoType?: string;
}): Promise<{ storageKey: string; mimeType: string; sizeBytes: number }> {
  const { scopeId, type, file, fileName, photoType } = params;
  const mimeType = (file as File).type || "application/octet-stream";
  const sizeBytes = file.size;

  const presignRes = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId: scopeId, type, photoType, fileName, mimeType, sizeBytes }),
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

  return { storageKey, mimeType, sizeBytes };
}

/**
 * Faz upload de um arquivo vinculado a uma solicitação (presign + confirm).
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
  const { storageKey, mimeType, sizeBytes } = await presignAndUpload({
    scopeId: requestId,
    type,
    file,
    fileName,
    photoType,
  });

  const confirmRes = await fetch("/api/uploads/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId, type, photoType, fileName, mimeType, sizeBytes, storageKey }),
  });
  if (!confirmRes.ok) throw new Error("Falha ao confirmar upload");

  return { storageKey };
}
