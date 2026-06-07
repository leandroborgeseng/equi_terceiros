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
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="text-sm leading-snug text-slate-700">
        <span className="mr-1 font-semibold text-slate-400">{index}.</span>
        {label}
      </p>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                "min-w-[3rem] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                value === o.value ? o.activeClass : "bg-slate-50 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"
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
              "rounded-lg p-2 transition-colors",
              showObs || hasObs
                ? "bg-amber-100 text-amber-800 ring-1 ring-amber-200"
                : "bg-slate-50 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"
            )}
          >
            <MessageSquarePlus className="h-4 w-4" />
          </button>
        )}

        {onFileUpload && (
          <label
            className={cn(
              "inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50",
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
              className="max-w-[8rem] truncate text-xs text-emerald-700 hover:underline"
            >
              {fileName}
            </a>
          </>
        )}
        {fileName && !fileUrl && (
          <span className="max-w-[10rem] truncate text-xs text-emerald-700">{fileName}</span>
        )}
      </div>

      {onObsChange && showObs && (
        <input
          type="text"
          value={obs ?? ""}
          onChange={(e) => onObsChange(e.target.value)}
          placeholder="Observação (opcional)"
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          autoFocus={showObs && !hasObs}
        />
      )}
    </div>
  );
}
