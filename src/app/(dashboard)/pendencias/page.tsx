"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/gesteq/page-header";
import { ActionPill } from "@/components/gesteq/action-pill";
import { RequestStatusBadge } from "@/components/requests/status-badge";
import type { RequestStatus } from "@/lib/enums";
import { formatDate } from "@/lib/utils";
import { statusSpineBorderClass } from "@/lib/status-tokens";
import { AlertTriangle, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  protocol: string;
  equipmentName: string;
  status: string;
  equipmentClass?: string | null;
  usageSector: string;
  regularizationDueAt?: string | null;
  regularizedAt?: string | null;
  flowType?: string;
};

export default function PendenciasPage() {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["pendencias"],
    queryFn: () => fetch("/api/requests?queue=pendencias").then((r) => r.json()) as Promise<Row[]>,
  });

  const overdueCount = rows.filter(
    (r) => r.regularizationDueAt && !r.regularizedAt && new Date(r.regularizationDueAt) < new Date()
  ).length;

  return (
    <div className="gesteq-rise space-y-5">
      <PageHeader
        eyebrow="Engenharia Clínica"
        title="Pendências"
        subtitle={`${rows.length} itens aguardando ação${overdueCount > 0 ? ` · ${overdueCount} em atraso` : ""}`}
      />

      {isLoading && <p className="text-sm text-[var(--muted)]">Carregando...</p>}

      <div className="gesteq-card overflow-hidden">
        {rows.map((r) => {
          const overdue =
            r.regularizationDueAt && !r.regularizedAt && new Date(r.regularizationDueAt) < new Date();
          return (
            <div
              key={r.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line-2)] px-4 py-3.5 transition-colors last:border-0 hover:bg-[var(--surface-2)]",
                statusSpineBorderClass(r.status as RequestStatus),
                overdue && "bg-[color-mix(in_oklch,var(--bloqueado-soft)_40%,transparent)]"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {overdue ? (
                    <AlertTriangle className="h-4 w-4 text-[var(--bloqueado-ink)]" />
                  ) : (
                    <Clock className="h-4 w-4 text-[var(--pendente-ink)]" />
                  )}
                  <span className="font-display text-[15px] font-semibold text-[var(--ink)]">
                    {r.equipmentName}
                  </span>
                  <RequestStatusBadge status={r.status as RequestStatus} size="sm" />
                </div>
                <p className="mt-1 font-mono-data text-xs text-[var(--muted)]">
                  {r.protocol} · {r.usageSector}
                  {r.flowType === "URGENCIA" && r.regularizationDueAt && (
                    <> · Regularizar até {formatDate(r.regularizationDueAt)}</>
                  )}
                </p>
              </div>
              <ActionPill
                href={`/dashboard/engenharia/solicitacoes/${r.id}`}
                variant="primary"
                className="!h-8 !text-xs"
              >
                Resolver
                <ChevronRight className="h-3.5 w-3.5" />
              </ActionPill>
            </div>
          );
        })}

        {!isLoading && rows.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-[var(--muted)]">
            Nenhuma pendência aberta.
          </p>
        )}
      </div>
    </div>
  );
}
