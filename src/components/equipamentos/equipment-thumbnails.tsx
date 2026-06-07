"use client";

import Link from "next/link";
import { Camera, ImageOff } from "lucide-react";

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
}: {
  requestId: string;
  thumbnails: EquipmentThumbnail[];
  max?: number;
}) {
  const visible = thumbnails.slice(0, max);
  const extra = thumbnails.length - visible.length;

  if (thumbnails.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400">
        <ImageOff className="h-4 w-4 shrink-0" />
        Sem fotos cadastradas
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Camera className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
        {visible.map((t) => (
          <Link
            key={t.id}
            href={`/dashboard/engenharia/solicitacoes/${requestId}?tab=fotos`}
            title={t.photoType.replace(/_/g, " ")}
            className="group relative shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm transition hover:border-emerald-300 hover:ring-2 hover:ring-emerald-200"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.url}
              alt={t.photoType}
              className="h-14 w-14 object-cover transition group-hover:scale-105 sm:h-16 sm:w-16"
              loading="lazy"
            />
            <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-1 py-0.5 text-[8px] text-white opacity-0 transition group-hover:opacity-100">
              {t.photoType.replace(/_/g, " ")}
            </span>
          </Link>
        ))}
        {extra > 0 && (
          <Link
            href={`/dashboard/engenharia/solicitacoes/${requestId}?tab=fotos`}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-200 sm:h-16 sm:w-16"
          >
            +{extra}
          </Link>
        )}
      </div>
    </div>
  );
}
