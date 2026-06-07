import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { deleteObject, getObjectBuffer, isS3Configured } from "@/lib/s3";

export function getUploadDir() {
  return process.env.UPLOAD_DIR ?? (process.env.NODE_ENV === "production" ? "/data/uploads" : "./uploads");
}

/** Chave relativa segura (ex.: requests/abc/FOTO/123-file.jpg). */
export function isValidStorageKey(key: string) {
  if (!key || key.length > 512) return false;
  if (key.includes("..") || key.startsWith("/") || key.includes("\\")) return false;
  return /^requests\/[a-zA-Z0-9_-]+\//.test(key);
}

function resolveLocalPath(storageKey: string) {
  const base = path.resolve(getUploadDir());
  const full = path.resolve(base, ...storageKey.split("/"));
  if (!full.startsWith(base + path.sep) && full !== base) {
    throw new Error("Caminho de arquivo inválido");
  }
  return full;
}

export async function saveLocalFile(storageKey: string, data: Buffer | Uint8Array) {
  if (!isValidStorageKey(storageKey)) throw new Error("Chave de armazenamento inválida");
  const filePath = resolveLocalPath(storageKey);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, data);
}

export async function readLocalFile(storageKey: string): Promise<Buffer | null> {
  if (!isValidStorageKey(storageKey)) return null;
  try {
    return await readFile(resolveLocalPath(storageKey));
  } catch {
    return null;
  }
}

export function guessMimeType(fileName: string, fallback = "application/octet-stream") {
  const ext = path.extname(fileName).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".pdf": "application/pdf",
    ".heic": "image/heic",
  };
  return map[ext] ?? fallback;
}

/** URL autenticada para exibir/baixar arquivo (local ou S3 via proxy). */
export function buildFileUrl(storageKey: string) {
  return `/api/files?key=${encodeURIComponent(storageKey)}`;
}

export async function readStoredFile(
  storageKey: string,
  fileName?: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const local = await readLocalFile(storageKey);
  if (local) {
    return { buffer: local, mimeType: guessMimeType(fileName ?? storageKey) };
  }

  if (isS3Configured()) {
    const remote = await getObjectBuffer(storageKey);
    if (remote) {
      return {
        buffer: remote.buffer,
        mimeType: remote.contentType ?? guessMimeType(fileName ?? storageKey),
      };
    }
  }

  return null;
}

export async function deleteLocalFile(storageKey: string) {
  if (!isValidStorageKey(storageKey)) return;
  try {
    await unlink(resolveLocalPath(storageKey));
  } catch {
    // arquivo já removido ou inexistente
  }
}

/** Remove do disco local e do S3 (quando configurado). */
export async function deleteStoredFile(storageKey: string) {
  await deleteLocalFile(storageKey);
  if (isS3Configured()) {
    await deleteObject(storageKey);
  }
}
