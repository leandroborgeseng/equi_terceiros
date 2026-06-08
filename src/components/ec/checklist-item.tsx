"use client";

import { useEffect, useState } from "react";
import { MessageSquarePlus, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileThumbnail, isImageFile, type PreviewFile } from "@/components/ec/file-preview";

export interface ChecklistOption {
  value: string;
  label: string;
  activeClass: string;
}

export function ChecklistItem({
  index,
  label,
  value,
  options,
  onChange,
  obs,
  onObsChange,
  onFileUpload,
  fileName,
  fileUrl,
  uploading,
}: {
  index: number;
  label: string;
  value?: string;
  options: ChecklistOption[];
  onChange: (value: string) => void;
  obs?: string;
  onObsChange?: (value: string) => void;
  onFileUpload?: (file: File) => void;
  fileName?: string | null;
  fileUrl?: string | null;
  uploading?: boolean;
}) {
  const hasObs = !!(obs?.trim());
  const [showObs, setShowObs] = useState(hasObs);

  useEffect(() => {
    if (hasObs) setShowObs(true);
  }, [hasObs]);

  return (
    <div className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-3.5">
      <p className="text-sm leading-snug text-[var(--ink-2)]">
        <span className="font-mono-data mr-1.5 font-semibold text-[var(--faint)]">{index}.</span>
        {label}
      </p>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <div className="gesteq-seg flex-wrap">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                "font-mono-data !text-xs",
                value === o.value && "on",
                value === o.value && o.activeClass.includes("emerald") && "!bg-[var(--brand-soft)] !text-[var(--brand-ink)]",
                value === o.value && o.activeClass.includes("red") && "!bg-[var(--bloqueado-soft)] !text-[var(--bloqueado-ink)]",
                value === o.value && o.activeClass.includes("amber") && "!bg-[var(--pendente-soft)] !text-[var(--pendente-ink)]"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        {onObsChange && (
          <button
            type="button"
            title={showObs ? "Ocultar observação" : "Adicionar observação"}
            aria-label={showObs ? "Ocultar observação" : "Adicionar observação"}
            onClick={() => setShowObs((s) => !s)}
            className={cn(
              "rounded-[var(--r)] border p-2 transition-colors",
              showObs || hasObs
                ? "border-[color-mix(in_oklch,var(--pendente)_35%,transparent)] bg-[var(--pendente-soft)] text-[var(--pendente-ink)]"
                : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)] hover:bg-[var(--line-2)]"
            )}
          >
            <MessageSquarePlus className="h-4 w-4" />
          </button>
        )}

        {onFileUpload && (
          <label
            className={cn(
              "inline-flex cursor-pointer items-center gap-1 rounded-[var(--r)] border border-[var(--line)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)]",
              uploading && "pointer-events-none opacity-60"
            )}
          >
            <Paperclip className="h-3.5 w-3.5" />
            {uploading ? "Enviando..." : "Anexar"}
            <input
              type="file"
              accept="application/pdf,image/*"
              capture="environment"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFileUpload(f);
              }}
            />
          </label>
        )}

        {fileName && fileUrl && (
          <>
            <FileThumbnail
              size="sm"
              file={
                {
                  id: `checklist-${index}`,
                  label,
                  fileName,
                  url: fileUrl,
                  isImage: isImageFile(fileName),
                } satisfies PreviewFile
              }
            />
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="max-w-[8rem] truncate text-xs text-[var(--brand-ink)] hover:underline"
            >
              {fileName}
            </a>
          </>
        )}
        {fileName && !fileUrl && (
          <span className="max-w-[10rem] truncate text-xs text-[var(--brand-ink)]">{fileName}</span>
        )}
      </div>

      {onObsChange && showObs && (
        <input
          type="text"
          value={obs ?? ""}
          onChange={(e) => onObsChange(e.target.value)}
          placeholder="Observação (opcional)"
          className="mt-2 w-full rounded-[var(--r)] border border-[var(--line)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]/30"
          autoFocus={showObs && !hasObs}
        />
      )}
    </div>
  );
}
