"use client";

import { cn } from "@/lib/utils";

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
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm text-slate-700">
          <span className="mr-1 font-semibold text-slate-400">{index}.</span>
          {label}
        </p>
        <div className="flex shrink-0 gap-1">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                value === o.value ? o.activeClass : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {onObsChange && (
        <input
          type="text"
          value={obs ?? ""}
          onChange={(e) => onObsChange(e.target.value)}
          placeholder="Observação"
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
        />
      )}

      {onFileUpload && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <label className="cursor-pointer rounded-lg border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50">
            Anexar
            <input
              type="file"
              accept="application/pdf,image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFileUpload(f);
              }}
            />
          </label>
          {fileName && <span className="truncate text-emerald-700">{fileName}</span>}
        </div>
      )}
    </div>
  );
}
