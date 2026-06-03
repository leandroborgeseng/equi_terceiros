"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, Download, ChevronLeft, ChevronRight, ScanText, Loader2 } from "lucide-react";
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

export function ImageGallery({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [compare, setCompare] = useState<number[]>([]);
  const [ocrLoading, setOcrLoading] = useState<string | null>(null);
  const [ocrResults, setOcrResults] = useState<Record<string, GalleryImageMetadata>>({});

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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Galeria ({images.length})</h3>
        {compare.length === 2 && (
          <Button size="sm" variant="outline" onClick={() => setIndex(compare[0])}>
            Comparar selecionadas
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100"
            onClick={() => setIndex(i)}
            onContextMenu={(e) => {
              e.preventDefault();
              setCompare((prev) =>
                prev.includes(i) ? prev.filter((x) => x !== i) : [...prev.slice(-1), i]
              );
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.photoType} className="h-full w-full object-cover" />
            {metaFor(img)?.aiValidationStatus && (
              <span
                className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  AI_BADGE[metaFor(img)!.aiValidationStatus as string] ?? AI_BADGE.PENDING
                }`}
              >
                {metaFor(img)!.aiValidationStatus}
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              {img.photoType}
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {current && index !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
              onClick={() => setIndex(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <button
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white"
              onClick={() => setIndex((index - 1 + images.length) % images.length)}
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white"
              onClick={() => setIndex((index + 1) % images.length)}
            >
              <ChevronRight />
            </button>
            <div className="max-h-[85vh] max-w-5xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.url}
                alt={current.fileName}
                className="max-h-[75vh] w-full object-contain"
              />
              <div className="mt-4 flex items-center justify-between text-white">
                <div>
                  <p className="font-medium">{current.photoType}</p>
                  <p className="text-sm text-white/70">{formatDateTime(current.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => runOcr(current.id)}
                    disabled={ocrLoading === current.id}
                    className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm"
                  >
                    {ocrLoading === current.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ScanText className="h-5 w-5" />
                    )}
                    OCR / IA
                  </button>
                  <a href={current.url} download className="rounded-lg bg-white/10 p-2">
                    <Download className="h-5 w-5" />
                  </a>
                  <span className="rounded-lg bg-white/10 p-2">
                    <ZoomIn className="h-5 w-5" />
                  </span>
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
