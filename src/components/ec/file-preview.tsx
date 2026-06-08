"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X, ExternalLink, ImageOff } from "lucide-react";

export type PreviewFile = {
  id: string;
  label: string;
  fileName: string;
  url: string;
  isImage: boolean;
};

export function isImageFile(fileName: string, mimeType?: string | null) {
  if (mimeType?.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif|heic|bmp)$/i.test(fileName);
}

export function fileUrlFromKey(storageKey: string) {
  return `/api/files?key=${encodeURIComponent(storageKey)}`;
}

function PreviewModal({
  file,
  onClose,
}: {
  file: PreviewFile;
  onClose: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </button>
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 text-white">
          <p className="font-medium">{file.label}</p>
          <p className="text-sm text-white/70">{file.fileName}</p>
        </div>
        <div className="min-h-[50vh] flex-1 overflow-hidden rounded-xl bg-white">
          {file.isImage && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.url}
              alt={file.fileName}
              className="mx-auto max-h-[75vh] w-full object-contain"
              onError={() => setImgError(true)}
            />
          ) : file.isImage && imgError ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-[var(--muted)]">
              <ImageOff className="h-10 w-10" />
              <p>Imagem indisponível</p>
            </div>
          ) : (
            <iframe
              src={file.url}
              title={file.fileName}
              className="h-[75vh] w-full border-0"
            />
          )}
        </div>
        <div className="mt-3 flex justify-end">
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir em nova aba
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/** Miniatura clicável — foto ou ícone PDF. */
export function FileThumbnail({
  file,
  size = "md",
}: {
  file: PreviewFile;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const dim = size === "sm" ? "h-12 w-12" : "h-20 w-20";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`Visualizar: ${file.fileName}`}
        className={`${dim} shrink-0 overflow-hidden rounded-[var(--r)] border border-[var(--line)] bg-[var(--surface-2)] shadow-sm transition hover:ring-2 hover:ring-[var(--brand-soft)]`}
      >
        {file.isImage && !thumbError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.url}
            alt={file.label}
            className="h-full w-full object-cover"
            onError={() => setThumbError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 bg-[var(--bloqueado-soft)] text-[var(--bloqueado-ink)]">
            <FileText className={size === "sm" ? "h-5 w-5" : "h-7 w-7"} />
            <span className="text-[9px] font-bold uppercase">PDF</span>
          </div>
        )}
      </button>
      <AnimatePresence>
        {open && <PreviewModal file={file} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

/** Grade de miniaturas de todos os arquivos do equipamento. */
export function FilePreviewGrid({ files }: { files: PreviewFile[] }) {
  const [active, setActive] = useState<PreviewFile | null>(null);

  if (files.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">Nenhum anexo ou foto vinculado ainda.</p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {files.map((file) => (
          <button
            key={file.id}
            type="button"
            onClick={() => setActive(file)}
            className="group flex flex-col overflow-hidden rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] text-left shadow-sm transition hover:border-[var(--brand-line)] hover:shadow-[var(--shadow)]"
          >
            <div className="relative aspect-square w-full bg-[var(--surface-2)]">
              {file.isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.url}
                  alt={file.label}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1 bg-[var(--bloqueado-soft)] text-[var(--bloqueado-ink)]">
                  <FileText className="h-8 w-8" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">PDF</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
            </div>
            <div className="border-t border-[var(--line-2)] p-2">
              <p className="line-clamp-2 text-[10px] font-medium leading-tight text-[var(--ink-2)]">
                {file.label}
              </p>
            </div>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {active && <PreviewModal file={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </>
  );
}
