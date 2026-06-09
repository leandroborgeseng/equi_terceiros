"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { User, MapPin } from "lucide-react";
import { RequestStatusBadge } from "./status-badge";
import { ClassTag } from "@/components/gesteq/class-tag";
import { ProgressMeter } from "@/components/gesteq/progress-meter";
import { countDocsOk, countInspOk } from "@/lib/queue-stages";
import { statusSpineBorderClass } from "@/lib/status-tokens";
import { DOC_CHECKLIST_ITEMS } from "@/lib/validators/request";
import { INSPECTION_ITEMS } from "@/lib/validators/request";
import type { RequestStatus, EquipmentClass } from "@/lib/enums";
import { cn } from "@/lib/utils";

export type RequestCardData = {
  id: string;
  protocol: string;
  internalOs?: string | null;
  status: RequestStatus;
  equipmentName: string;
  brand: string;
  model: string;
  serialNumber?: string | null;
  equipmentClass?: EquipmentClass | string | null;
  usageSector: string;
  supplierName?: string;
  doctor?: { name: string } | null;
  requesterName?: string | null;
  plannedDate?: string;
  plannedTime?: string;
  isUrgent?: boolean;
  validUntil?: string | null;
  createdAt?: string;
  documentChecklist?: Record<string, unknown> | null;
  technicalInspection?: Record<string, unknown> | null;
};

function relTime(dateStr?: string) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function RequestCard({
  request,
  href,
  compact = false,
  kanban = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: {
  request: RequestCardData;
  href: string;
  compact?: boolean;
  kanban?: boolean;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const router = useRouter();
  const dragRef = useRef(false);
  const docsOk = countDocsOk(request.documentChecklist);
  const inspOk = countInspOk(request.technicalInspection);
  const docsTotal = DOC_CHECKLIST_ITEMS.length;
  const inspTotal = INSPECTION_ITEMS.length;
  const requester = request.doctor?.name ?? request.requesterName ?? "—";
  const overdue =
    request.validUntil && new Date(request.validUntil) < new Date() && !["RETIRADO"].includes(request.status);

  const card = (
    <div
      className={cn(
        "gesteq-card relative overflow-hidden transition-shadow",
        !kanban && "gesteq-rise",
        statusSpineBorderClass(request.status),
        kanban ? "cursor-grab active:cursor-grabbing" : "cursor-pointer hover:shadow-[var(--shadow)]",
        isDragging && "opacity-50 ring-2 ring-[var(--brand)]"
      )}
      draggable={kanban}
      onDragStart={
        kanban
          ? (e) => {
              dragRef.current = true;
              e.dataTransfer.setData("text/request-id", request.id);
              e.dataTransfer.effectAllowed = "move";
              onDragStart?.();
            }
          : undefined
      }
      onDragEnd={
        kanban
          ? () => {
              window.setTimeout(() => {
                dragRef.current = false;
              }, 0);
              onDragEnd?.();
            }
          : undefined
      }
      onClick={
        kanban
          ? () => {
              if (dragRef.current) return;
              router.push(href);
            }
          : undefined
      }
    >
      <div className={cn("px-4 py-3", compact ? "pb-2.5" : "pb-3")} style={{ paddingLeft: 16 }}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-mono-data text-[11px] text-[var(--faint)]">
            {request.protocol}
            {request.internalOs ? ` · ${request.internalOs}` : ""}
          </span>
          <div className="flex items-center gap-1.5">
            {request.isUrgent && (
              <span className="gesteq-badge gesteq-st-urgencia sm">
                <span className="gesteq-dot" />
                Urgente
              </span>
            )}
            {overdue && (
              <span className="gesteq-badge gesteq-st-bloqueado sm">
                <span className="gesteq-dot" />
                Vencido
              </span>
            )}
            {request.equipmentClass && <ClassTag classe={request.equipmentClass} />}
          </div>
        </div>

        <h3 className="font-display text-base font-semibold leading-snug text-[var(--ink)]">
          {request.equipmentName}
        </h3>
        <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
          {request.brand} · {request.model} ·{" "}
          <span className="font-mono-data text-[11.5px]">{request.serialNumber || "—"}</span>
        </p>

        {!compact && (
          <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-[var(--ink-2)]">
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3 text-[var(--faint)]" />
              {requester}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[var(--faint)]" />
              {request.usageSector}
            </span>
          </div>
        )}

        <div className={cn("flex gap-3.5", compact ? "mt-2.5" : "mt-3")}>
          <div className="flex-1">
            <div className="gesteq-eyebrow mb-0.5 flex justify-between">
              <span>Docs</span>
              <span
                className={cn(
                  "font-mono-data",
                  docsOk === docsTotal ? "text-[var(--liberado-ink)]" : "text-[var(--muted)]"
                )}
              >
                {docsOk}/{docsTotal}
              </span>
            </div>
            <ProgressMeter
              value={docsOk}
              total={docsTotal}
              tone={docsOk === docsTotal ? "var(--liberado)" : "var(--docs)"}
            />
          </div>
          <div className="flex-1">
            <div className="gesteq-eyebrow mb-0.5 flex justify-between">
              <span>Inspeção</span>
              <span
                className={cn(
                  "font-mono-data",
                  inspOk === inspTotal ? "text-[var(--liberado-ink)]" : "text-[var(--muted)]"
                )}
              >
                {inspOk}/{inspTotal}
              </span>
            </div>
            <ProgressMeter
              value={inspOk}
              total={inspTotal}
              tone={inspOk === inspTotal ? "var(--liberado)" : "var(--inspecao)"}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--line-2)] bg-[var(--surface-2)] px-4 py-2">
        <RequestStatusBadge status={request.status} size="sm" />
        {request.createdAt && (
          <span className="font-mono-data text-[10.5px] text-[var(--faint)]">{relTime(request.createdAt)}</span>
        )}
      </div>
    </div>
  );

  if (kanban) {
    return <div className="block shrink-0">{card}</div>;
  }

  return (
    <Link href={href} className="block">
      {card}
    </Link>
  );
}
