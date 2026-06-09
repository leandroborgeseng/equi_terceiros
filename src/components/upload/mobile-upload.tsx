"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, Upload, CheckCircle2, AlertCircle, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { queueOfflineUpload } from "@/lib/offline-queue";
import { uploadBlobToStorage } from "@/lib/upload-client";

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,application/pdf";

async function compressImage(file: File, maxWidth = 1920, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality)
  );
}

function qualityScore(file: File, blob: Blob) {
  const ratio = blob.size / file.size;
  if (ratio > 0.7) return "Alta";
  if (ratio > 0.4) return "Média";
  return "Otimizada";
}

export function MobileUpload({
  requestId,
  type,
  photoType,
  label,
  onUploaded,
}: {
  requestId: string;
  type: string;
  photoType?: string;
  label: string;
  onUploaded?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "offline" | "error">("idle");
  const [quality, setQuality] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setStatus("uploading");
      const blob = await compressImage(file);
      setQuality(qualityScore(file, blob));
      setPreview(URL.createObjectURL(blob));

      if (!navigator.onLine) {
        await queueOfflineUpload({
          requestId,
          type,
          photoType,
          blob,
          fileName: file.name,
          mimeType: blob.type || file.type,
        });
        setStatus("offline");
        onUploaded?.();
        return;
      }

      try {
        const presignRes = await fetch("/api/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId,
            type,
            photoType,
            fileName: file.name,
            mimeType: blob.type || file.type,
            sizeBytes: blob.size,
          }),
        });
        if (!presignRes.ok) throw new Error("Falha ao preparar upload");
        const { uploadUrl, storageKey, useLocal } = await presignRes.json();

        await uploadBlobToStorage({
          uploadUrl,
          useLocal: !!useLocal,
          storageKey,
          mimeType: blob.type || file.type,
          body: blob,
        });

        const confirmRes = await fetch("/api/uploads/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId,
            type,
            photoType,
            fileName: file.name,
            mimeType: blob.type || file.type,
            sizeBytes: blob.size,
            storageKey,
          }),
        });
        if (!confirmRes.ok) throw new Error("Falha ao confirmar upload");
        setStatus("done");
        onUploaded?.();
      } catch (e) {
        await queueOfflineUpload({
          requestId,
          type,
          photoType,
          blob,
          fileName: file.name,
          mimeType: blob.type || file.type,
        });
        setStatus("offline");
        setError(e instanceof Error ? e.message : "Erro no upload");
        onUploaded?.();
      }
    },
    [requestId, type, photoType, onUploaded]
  );

  return (
    <div
      className={cn(
        "rounded-[var(--r-xl)] border border-dashed bg-[var(--surface-2)]/50 p-4 transition-colors",
        dragOver ? "border-[var(--brand)] bg-[var(--brand-soft)]/50" : "border-[var(--line)]"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        files.forEach((file) => processFile(file));
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--ink)]">{label}</p>
        {quality && <span className="text-xs text-[var(--muted)]">Qualidade: {quality}</span>}
      </div>

      {preview && (
        <div className="relative mb-3 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className="h-40 w-full object-cover" />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
      />

      {dragOver && (
        <p className="mb-2 flex items-center gap-1 text-xs text-[var(--brand-ink)]">
          <ImagePlus className="h-3 w-3" /> Solte os arquivos aqui
        </p>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="h-4 w-4" />
          Câmera / Arquivo
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ACCEPT;
            input.multiple = true;
            input.onchange = async () => {
              for (const file of Array.from(input.files ?? [])) {
                await processFile(file);
              }
            };
            input.click();
          }}
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs">
        {status === "uploading" && (
          <>
            <Loader2 className="h-3 w-3 animate-spin text-[var(--brand)]" />
            <span className="text-[var(--muted)]">Enviando...</span>
          </>
        )}
        {status === "done" && (
          <>
            <CheckCircle2 className="h-3 w-3 text-[var(--brand)]" />
            <span className="text-[var(--brand-ink)]">Enviado</span>
          </>
        )}
        {status === "offline" && (
          <>
            <AlertCircle className="h-3 w-3 text-[var(--restricao)]" />
            <span className="text-[var(--restricao-ink)]">Salvo offline — sincronizará depois</span>
          </>
        )}
        {status === "error" && <span className="text-red-600">{error}</span>}
      </div>
    </div>
  );
}

export { OfflineSyncBar as OfflineSyncBanner } from "@/components/pwa/offline-sync-bar";
