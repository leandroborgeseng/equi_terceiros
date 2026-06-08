"use client";

import Link from "next/link";
import { Camera } from "lucide-react";

export type EquipmentThumbnail = {
  id: string;
  photoType: string;
  url: string;
  fileName?: string;
};

export function EquipmentThumbnails({
  requestId,
  thumbnails,
  max = 4,
  compact = false,
}: {
  requestId: string;
  thumbnails: EquipmentThumbnail[];
  max?: number;
  compact?: boolean;
}) {
  const visible = thumbnails.slice(0, max);
  const extra = thumbnails.length - visible.length;

  if (thumbnails.length === 0) {
    if (compact) {
      return (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="inline-block h-[14px] w-[18px] rounded-[3px] border border-dashed border-[var(--line)]" />
          <span className="gesteq-eyebrow text-[9.5px]">Sem fotos</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 rounded-[var(--r)] border border-dashed border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--faint)]">
        Sem fotos cadastradas
      </div>
    );
  }

  if (compact) {
    return (
      <Link
        href={`/dashboard/engenharia/solicitacoes/${requestId}?tab=fotos`}
        className="mt-1.5 flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        {visible.map((t) => (
          <div
            key={t.id}
            title={t.photoType.replace(/_/g, " ")}
            className="h-[18px] w-7 shrink-0 overflow-hidden rounded-[3px] border border-[var(--line)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.url} alt="" className="h-full w-full object-cover" loading="lazy" />
          </div>
        ))}
        {extra > 0 && (
          <span className="font-mono-data rounded border border-[var(--line)] bg-[var(--surface-2)] px-1 py-px text-[10px] font-semibold text-[var(--muted)]">
            +{extra}
          </span>
        )}
        <Camera className="ml-0.5 h-2.5 w-2.5 text-[var(--faint)]" />
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Camera className="h-3.5 w-3.5 shrink-0 text-[var(--faint)]" />
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {visible.map((t) => (
          <Link
            key={t.id}
            href={`/dashboard/engenharia/solicitacoes/${requestId}?tab=fotos`}
            title={t.photoType.replace(/_/g, " ")}
            className="group relative shrink-0 overflow-hidden rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)] transition hover:border-[var(--brand-line)] hover:ring-2 hover:ring-[var(--brand-soft)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.url}
              alt={t.photoType}
              className="h-14 w-14 object-cover transition group-hover:scale-105 sm:h-16 sm:w-16"
              loading="lazy"
            />
          </Link>
        ))}
        {extra > 0 && (
          <Link
            href={`/dashboard/engenharia/solicitacoes/${requestId}?tab=fotos`}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)] text-xs font-medium text-[var(--muted)] hover:bg-[var(--line-2)] sm:h-16 sm:w-16"
          >
            +{extra}
          </Link>
        )}
      </div>
    </div>
  );
}
