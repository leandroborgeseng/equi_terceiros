"use client";

import {
  getPendingUploads,
  updateUploadStatus,
  removeOfflineUpload,
} from "@/lib/offline-queue";

export async function syncPendingUploads(): Promise<{
  synced: number;
  failed: number;
}> {
  const pending = await getPendingUploads();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      await updateUploadStatus(item.id, "syncing");
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: item.requestId,
          type: item.type,
          photoType: item.photoType,
          fileName: item.fileName,
          mimeType: item.mimeType,
          sizeBytes: item.blob.size,
        }),
      });
      if (!presignRes.ok) throw new Error("presign failed");
      const { uploadUrl, storageKey, useLocal } = await presignRes.json();

      if (uploadUrl && !useLocal) {
        await fetch(uploadUrl, {
          method: "PUT",
          body: item.blob,
          headers: { "Content-Type": item.mimeType },
        });
      }

      const confirmRes = await fetch("/api/uploads/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: item.requestId,
          type: item.type,
          photoType: item.photoType,
          fileName: item.fileName,
          mimeType: item.mimeType,
          sizeBytes: item.blob.size,
          storageKey,
        }),
      });
      if (!confirmRes.ok) throw new Error("confirm failed");

      await removeOfflineUpload(item.id);
      synced++;
    } catch {
      await updateUploadStatus(item.id, "error", "Falha na sincronização");
      failed++;
    }
  }

  return { synced, failed };
}
