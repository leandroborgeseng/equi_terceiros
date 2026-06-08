"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode, X, Copy, ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";

export function QrButton({
  qrToken,
  variant = "link",
}: {
  qrToken?: string | null;
  variant?: "link" | "pill";
}) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!open || !qrToken) return;
    const consultUrl = `${window.location.origin}/equipamento/${qrToken}`;
    setUrl(consultUrl);
    QRCode.toDataURL(consultUrl, { margin: 1, width: 240 }).then(setDataUrl).catch(() => setDataUrl(null));
  }, [open, qrToken]);

  if (!qrToken) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          variant === "pill"
            ? "gesteq-pill gesteq-pill-ghost"
            : "flex items-center gap-1 text-sm text-[var(--brand-ink)] hover:underline"
        )}
      >
        <QrCode className="h-3.5 w-3.5" />
        {variant === "pill" ? "QR" : "Ver QR / consulta"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-[var(--r-xl)] bg-[var(--card)] p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display font-semibold text-[var(--ink)]">Consulta pública do equipamento</p>
              <button onClick={() => setOpen(false)} aria-label="Fechar">
                <X className="h-5 w-5 text-[var(--muted)]" />
              </button>
            </div>
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dataUrl} alt="QR Code" className="mx-auto h-56 w-56" />
            ) : (
              <p className="py-12 text-sm text-[var(--muted)]">Gerando QR...</p>
            )}
            <p className="mt-3 break-all rounded-[var(--r-md)] bg-[var(--surface-2)] p-2 font-mono-data text-xs text-[var(--muted)]">{url}</p>
            <div className="mt-3 flex justify-center gap-2">
              <button
                onClick={() => navigator.clipboard?.writeText(url)}
                className="flex items-center gap-1 rounded-[var(--r-md)] border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
              >
                <Copy className="h-4 w-4" /> Copiar link
              </button>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 rounded-[var(--r-md)] bg-[var(--brand)] px-3 py-1.5 text-sm text-white hover:opacity-90"
              >
                <ExternalLink className="h-4 w-4" /> Abrir
              </a>
            </div>
            <p className="mt-3 text-xs text-[var(--muted)]">
              Aponte a câmera para o QR da etiqueta para abrir esta mesma página.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
