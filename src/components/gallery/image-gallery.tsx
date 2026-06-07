"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ScanText,
  Loader2,
  ImageOff,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

export type GalleryImageMetadata = {
  serialDetected?: string | null;
  manufacturerDetected?: string | null;
  modelDetected?: string | null;
  aiValidationStatus?: string | null;
  processedAt?: string | null;
};

export type GalleryImage = {
  id: string;
  url: string;
  photoType: string;
  fileName: string;
  createdAt: string;
  metadata?: GalleryImageMetadata | null;
};

const AI_BADGE: Record<string, string> = {
  VALIDATED: "bg-emerald-100 text-emerald-800",
  MANUAL_REVIEW: "bg-amber-100 text-amber-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  FAILED: "bg-red-100 text-red-800",
  PENDING: "bg-slate-100 text-slate-600",
};

function GalleryThumb({
  img,
  onOpen,
  onCompare,
  onDelete,
  deleting,
  canDelete,
  meta,
}: {
  img: GalleryImage;
  onOpen: () => void;
  onCompare: () => void;
  onDelete?: () => void;
  deleting?: boolean;
  canDelete?: boolean;
  meta: GalleryImageMetadata | null;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100">
    <button
      type="button"
      className="h-full w-full"
      onClick={onOpen}
      onContextMenu={(e) => {
        e.preventDefault();
        onCompare();
      }}
    >
      {failed ? (
        <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center text-xs text-slate-500">
          <ImageOff className="h-6 w-6 text-slate-400" />
          <span>Imagem indisponível</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img.url}
          alt={img.photoType}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
      {meta?.aiValidationStatus && (
        <span
          className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium ${
            AI_BADGE[meta.aiValidationStatus as string] ?? AI_BADGE.PENDING
          }`}
        >
          {meta.aiValidationStatus}
        </span>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        {img.photoType}
      </div>
    </button>
      {canDelete && onDelete && (
        <button
          type="button"
          title="Excluir foto"
          disabled={deleting}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-1.5 top-1.5 rounded-lg bg-red-600/90 p-1.5 text-white opacity-0 shadow transition-opacity hover:bg-red-600 group-hover:opacity-100 disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </div>
  );
}

export function ImageGallery({
  images,
  canDelete = false,
  onDeleted,
}: {
  images: GalleryImage[];
  canDelete?: boolean;
  onDeleted?: () => void;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const [compare, setCompare] = useState<number[]>([]);
  const [ocrLoading, setOcrLoading] = useState<string | null>(null);
  const [ocrResults, setOcrResults] = useState<Record<string, GalleryImageMetadata>>({});
  const [lightboxFailed, setLightboxFailed] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const current = index !== null ? images[index] : null;

  async function runOcr(imageId: string) {
    setOcrLoading(imageId);
    try {
      const res = await fetch(`/api/images/${imageId}/ocr`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.metadata) {
        setOcrResults((prev) => ({ ...prev, [imageId]: data.metadata }));
      }
    } finally {
      setOcrLoading(null);
    }
  }

  function metaFor(img: GalleryImage): GalleryImageMetadata | null {
    return ocrResults[img.id] ?? img.metadata ?? null;
  }

  function openAt(i: number) {
    setLightboxFailed(false);
    setIndex(i);
  }

  async function deleteImage(imageId: string) {
    if (!confirm("Excluir esta foto? A ação não pode ser desfeita.")) return;
    setDeleteError(null);
    setDeletingId(imageId);
    try {
      const res = await fetch(`/api/images/${imageId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Erro ao excluir foto");
      if (index !== null && images[index]?.id === imageId) setIndex(null);
      setCompare((prev) =>
        prev.filter((i) => images[i]?.id !== imageId)
      );
      onDeleted?.();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Erro ao excluir");
    } finally {
      setDeletingId(null);
    }
  }

  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
        Nenhuma foto enviada ainda. Use o checklist ou a seção de fotos obrigatórias.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Galeria ({images.length})</h3>
        <div className="flex items-center gap-2">
          {compare.length === 2 && (
            <Button size="sm" variant="outline" onClick={() => openAt(compare[0])}>
              Comparar selecionadas
            </Button>
          )}
          {deleteError && <span className="text-xs text-red-600">{deleteError}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <GalleryThumb
            key={img.id}
            img={img}
            meta={metaFor(img)}
            canDelete={canDelete}
            deleting={deletingId === img.id}
            onDelete={() => deleteImage(img.id)}
            onOpen={() => openAt(i)}
            onCompare={() =>
              setCompare((prev) =>
                prev.includes(i) ? prev.filter((x) => x !== i) : [...prev.slice(-1), i]
              )
            }
          />
        ))}
      </div>

      <AnimatePresence>
        {current && index !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setIndex(null)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={() => setIndex(null)}
            >
              <X className="h-6 w-6" />
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    openAt((index - 1 + images.length) % images.length);
                  }}
                >
                  <ChevronLeft />
                </button>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    openAt((index + 1) % images.length);
                  }}
                >
                  <ChevronRight />
                </button>
              </>
            )}
            <div
              className="max-h-[90vh] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxFailed ? (
                <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-white/80">
                  <ImageOff className="h-12 w-12" />
                  <p>Não foi possível carregar esta imagem.</p>
                  <p className="text-sm text-white/50">{current.fileName}</p>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.url}
                  alt={current.fileName}
                  className="mx-auto max-h-[75vh] w-auto max-w-full object-contain"
                  onError={() => setLightboxFailed(true)}
                />
              )}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-white">
                <div>
                  <p className="font-medium">{current.photoType}</p>
                  <p className="text-sm text-white/70">{formatDateTime(current.createdAt)}</p>
                  <p className="text-xs text-white/50">
                    {index + 1} de {images.length}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => runOcr(current.id)}
                    disabled={ocrLoading === current.id}
                    className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
                  >
                    {ocrLoading === current.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ScanText className="h-5 w-5" />
                    )}
                    OCR / IA
                  </button>
                  <a
                    href={current.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
                  >
                    <Download className="h-5 w-5" /> Abrir
                  </a>
                  {canDelete && (
                    <button
                      type="button"
                      disabled={deletingId === current.id}
                      onClick={() => deleteImage(current.id)}
                      className="flex items-center gap-1 rounded-lg bg-red-600/80 px-3 py-2 text-sm hover:bg-red-600 disabled:opacity-50"
                    >
                      {deletingId === current.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                      Excluir
                    </button>
                  )}
                </div>
              </div>
              {metaFor(current) && (
                <div className="mt-3 rounded-xl bg-white/10 p-3 text-sm text-white/90">
                  <p className="mb-1 font-medium">Leitura automática (OCR/IA)</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-white/80">
                    <span>Série: {metaFor(current)?.serialDetected ?? "—"}</span>
                    <span>Fabricante: {metaFor(current)?.manufacturerDetected ?? "—"}</span>
                    <span>Modelo: {metaFor(current)?.modelDetected ?? "—"}</span>
                    <span>Status: {metaFor(current)?.aiValidationStatus ?? "—"}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
