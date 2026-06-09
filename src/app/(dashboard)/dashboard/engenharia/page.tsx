"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, List, Search, X, Zap, AlertCircle } from "lucide-react";
import { RequestCard, type RequestCardData } from "@/components/requests/request-card";
import { FilterChip } from "@/components/gesteq/filter-chip";
import { SegToggle } from "@/components/gesteq/seg-toggle";
import {
  HOMOLOGATION_STAGES,
  QUEUE_COUNTERS,
  stageForStatus,
  type StageKey,
} from "@/lib/queue-stages";
import { cn } from "@/lib/utils";

type QueueStats = {
  queue?: Record<string, number>;
};

export default function EngenhariaDashboardPage() {
  const qc = useQueryClient();
  const [view, setView] = useState<"board" | "list">("board");
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropStage, setDropStage] = useState<StageKey | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  const { data: stats } = useQuery<QueueStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetch("/api/dashboard/stats").then((r) => r.json()),
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["requests", "engenharia"],
    queryFn: () => fetch("/api/requests?queue=engenharia").then((r) => r.json()),
  });

  const rows = requests as RequestCardData[];

  const moveMutation = useMutation({
    mutationFn: async ({ requestId, stage }: { requestId: string; stage: StageKey }) => {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "moveStage", stage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível mover o card");
      return data;
    },
    onSuccess: () => {
      setMoveError(null);
      qc.invalidateQueries({ queryKey: ["requests", "engenharia"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (e: Error) => setMoveError(e.message),
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const q of QUEUE_COUNTERS) {
      if (q.id === "__urg") c[q.id] = rows.filter((r) => r.isUrgent).length;
      else if (q.id === "__venc") {
        c[q.id] = rows.filter(
          (r) => r.validUntil && new Date(r.validUntil) < new Date() && r.status !== "RETIRADO"
        ).length;
      } else if (q.statKey && stats?.queue) {
        c[q.id] = stats.queue[q.statKey] ?? rows.filter((r) => r.status === q.id).length;
      } else {
        c[q.id] = rows.filter((r) => r.status === q.id).length;
      }
    }
    return c;
  }, [rows, stats]);

  const filtered = useMemo(() => {
    let list = rows;
    if (filter === "__urg") list = list.filter((r) => r.isUrgent);
    else if (filter === "__venc") {
      list = list.filter(
        (r) => r.validUntil && new Date(r.validUntil) < new Date() && r.status !== "RETIRADO"
      );
    } else if (filter) list = list.filter((r) => r.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        [
          r.equipmentName,
          r.serialNumber,
          r.doctor?.name,
          r.requesterName,
          r.usageSector,
          r.protocol,
          r.internalOs,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    return list;
  }, [rows, filter, search]);

  const priority = rows.filter(
    (r) =>
      r.isUrgent ||
      (r.validUntil && new Date(r.validUntil) < new Date() && r.status !== "RETIRADO")
  );

  function handleDrop(stage: StageKey, requestId: string) {
    setDropStage(null);
    setDraggingId(null);
    moveMutation.mutate({ requestId, stage });
  }

  return (
    <div className="flex min-h-[60vh] flex-col">
      {/* Toolbar */}
      <div className="mb-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="gesteq-eyebrow mb-1.5">Engenharia Clínica · NP 445.000</div>
            <h1 className="font-display m-0 text-[27px] font-semibold tracking-tight text-[var(--ink)]">
              Fila de Homologação
            </h1>
            <p className="mt-1 text-[13.5px] text-[var(--muted)]">
              {rows.length} equipamentos no ciclo ·{" "}
              <span className="font-mono-data text-[var(--urgencia-ink)]">
                {priority.length} prioritários
              </span>
              {view === "board" && (
                <span className="text-[var(--faint)]"> · arraste cards entre colunas</span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar série, OS, equipamento…"
                className="font-mono-data h-10 w-[240px] max-w-[46vw] rounded-[var(--r)] border border-[var(--line)] bg-[var(--surface)] py-0 pl-9 pr-3 text-[12.5px] text-[var(--ink)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
              />
            </div>
            <SegToggle
              value={view}
              onChange={setView}
              options={[
                { value: "board", label: "Quadro", icon: LayoutGrid },
                { value: "list", label: "Lista", icon: List },
              ]}
            />
          </div>
        </div>

        {moveError && (
          <div className="mb-4 flex items-start gap-2 rounded-[var(--r-lg)] border border-[color-mix(in_oklch,var(--bloqueado)_30%,transparent)] bg-[var(--bloqueado-soft)] px-3 py-2.5 text-sm text-[var(--bloqueado-ink)]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{moveError}</span>
            <button type="button" className="ml-auto text-xs underline" onClick={() => setMoveError(null)}>
              Fechar
            </button>
          </div>
        )}

        {/* Priority rail */}
        {priority.length > 0 && (
          <div
            className="mb-4 rounded-[var(--r-lg)] border p-3.5"
            style={{
              borderColor: "color-mix(in oklch, var(--urgencia) 26%, transparent)",
              background: "linear-gradient(180deg, var(--urgencia-soft), var(--surface))",
            }}
          >
            <div className="mb-2.5 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[var(--urgencia-ink)]" />
              <span className="gesteq-eyebrow text-[var(--urgencia-ink)]">Prioridade · ação imediata</span>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {priority.map((r) => (
                <div key={r.id} className="min-w-[256px] shrink-0">
                  <RequestCard
                    request={r}
                    href={`/dashboard/engenharia/solicitacoes/${r.id}`}
                    compact
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {QUEUE_COUNTERS.map((c) => (
            <FilterChip
              key={c.id}
              active={filter === c.id}
              count={counts[c.id] ?? 0}
              label={c.label}
              dotCls={c.cls}
              onClick={() => setFilter(filter === c.id ? null : c.id)}
            />
          ))}
          {filter && (
            <button
              type="button"
              onClick={() => setFilter(null)}
              className="gesteq-pill gesteq-pill-ghost self-center !h-8"
            >
              <X className="h-3.5 w-3.5" />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Board */}
      {view === "board" ? (
        <div className="min-h-[460px] flex-1 overflow-x-auto pb-2">
          <div className="flex min-h-[460px] flex-col gap-3.5 md:flex-row md:items-start">
            {HOMOLOGATION_STAGES.map((stage) => {
              const items = filtered.filter((r) => stageForStatus(r.status) === stage.key);
              const isDropTarget = dropStage === stage.key && draggingId !== null;

              return (
                <div
                  key={stage.key}
                  className={cn(
                    "flex w-full shrink-0 flex-col md:w-[280px]",
                    isDropTarget && "rounded-[var(--r-lg)] bg-[var(--brand-soft)] ring-2 ring-[var(--brand)]"
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setDropStage(stage.key);
                  }}
                  onDragLeave={() => setDropStage((s) => (s === stage.key ? null : s))}
                  onDrop={(e) => {
                    e.preventDefault();
                    const requestId = e.dataTransfer.getData("text/request-id");
                    if (requestId) handleDrop(stage.key, requestId);
                  }}
                >
                  <div className="mb-3 flex shrink-0 items-center gap-2 px-1 py-1">
                    <span className="font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-sm font-semibold text-[var(--ink-2)]">
                      {stage.n}
                    </span>
                    <div className="min-w-0">
                      <div className="font-display text-sm font-semibold text-[var(--ink)]">{stage.label}</div>
                      <div className="gesteq-eyebrow text-[9px]">{stage.hint}</div>
                    </div>
                    <span className="font-mono-data ml-auto rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 py-0.5 text-xs font-semibold text-[var(--muted)]">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5 px-1 pb-3">
                    {items.map((r) => (
                      <RequestCard
                        key={r.id}
                        request={r}
                        href={`/dashboard/engenharia/solicitacoes/${r.id}`}
                        kanban
                        isDragging={draggingId === r.id}
                        onDragStart={() => {
                          setDraggingId(r.id);
                          setMoveError(null);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDropStage(null);
                        }}
                      />
                    ))}
                    {items.length === 0 && (
                      <div
                        className={cn(
                          "rounded-[var(--r-lg)] border border-dashed px-4 py-8 text-center text-xs text-[var(--faint)]",
                          isDropTarget ? "border-[var(--brand)] text-[var(--brand-ink)]" : "border-[var(--line)]"
                        )}
                      >
                        {isDropTarget ? "Solte aqui" : "Nenhum item"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              href={`/dashboard/engenharia/solicitacoes/${r.id}`}
            />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-[var(--muted)]">
              Nenhuma solicitação para os filtros selecionados.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
