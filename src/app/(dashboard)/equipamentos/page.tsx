"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { RequestStatusBadge } from "@/components/requests/status-badge";
import type { RequestStatus } from "@/lib/enums";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  Copy,
  Printer,
  Loader2,
  ClipboardList,
  ChevronRight,
  Stethoscope,
  Building2,
  X,
  ChevronDown,
} from "lucide-react";
import { labelsPerA4Page } from "@/lib/label-layout";
import {
  buildDoctorOptions,
  buildSupplierOptions,
  labelFromFilterKey,
  matchesDoctorFilter,
  matchesSupplierFilter,
} from "@/lib/equipment-filters";
import {
  EquipmentThumbnails,
  type EquipmentThumbnail,
} from "@/components/equipamentos/equipment-thumbnails";
import { PageHeader } from "@/components/gesteq/page-header";
import { ActionPill } from "@/components/gesteq/action-pill";
import { FilterPills } from "@/components/gesteq/filter-pills";
import { ClassTag } from "@/components/gesteq/class-tag";
import { statusSpineBorderClass } from "@/lib/status-tokens";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  protocol: string;
  internalOs?: string | null;
  equipmentName: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: string;
  equipmentClass?: string | null;
  usageSector: string;
  doctor?: { id: string; name: string } | null;
  requesterName?: string | null;
  submittedViaPublic?: boolean;
  supplier?: { id: string; name: string } | null;
  supplierName: string;
  plannedDate: string;
  thumbnails?: EquipmentThumbnail[];
};

const STATUS_OPTS = [
  { value: "TODOS" as const, label: "Todos" },
  { value: "AGUARDANDO_CADASTRO" as const, label: "Aguard. cadastro", dot: "aguard-cad" },
  { value: "AGUARDANDO_DOCUMENTOS" as const, label: "Aguard. docs", dot: "docs" },
  { value: "PENDENTE_DOCUMENTOS" as const, label: "Pendentes", dot: "pendente" },
  { value: "AGUARDANDO_INSPECAO" as const, label: "Inspeção", dot: "inspecao" },
  { value: "LIBERADO" as const, label: "Liberados", dot: "liberado" },
  { value: "BLOQUEADO" as const, label: "Bloqueados", dot: "bloqueado" },
  { value: "FLUXO_URGENCIA" as const, label: "Urgência", dot: "urgencia" },
];

const CLASS_OPTS = [
  { value: "TODAS" as const, label: "Todas" },
  { value: "A" as const, label: "Classe A" },
  { value: "B" as const, label: "Classe B" },
  { value: "C" as const, label: "Classe C" },
  { value: "D" as const, label: "Classe D" },
];

const PER_PAGE = labelsPerA4Page();

function EquipRow({
  r,
  selected,
  onSelect,
  showSupplier,
}: {
  r: Row;
  selected: boolean;
  onSelect: () => void;
  showSupplier: boolean;
}) {
  const router = useRouter();
  const requester = r.doctor?.name ?? r.requesterName ?? "—";

  return (
    <div
      className={cn(
        "group relative grid cursor-pointer items-start gap-3 border-b border-[var(--line-2)] px-3 py-3 transition-colors hover:bg-[var(--surface-2)] sm:grid-cols-[28px_1.6fr_0.85fr_1fr_0.55fr_auto] sm:gap-4 sm:px-4 sm:py-3.5",
        statusSpineBorderClass(r.status as RequestStatus)
      )}
      onClick={() => router.push(`/dashboard/engenharia/solicitacoes/${r.id}`)}
    >
      <div className="col-span-full flex gap-3 sm:col-span-1 sm:contents">
        <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="h-[15px] w-[15px] cursor-pointer accent-[var(--brand)]"
            aria-label={`Selecionar ${r.equipmentName}`}
          />
        </div>

        <div className="min-w-0 flex-1 sm:col-span-1">
          <div className="mb-0.5 flex flex-wrap items-center gap-2">
            <span className="text-[14.5px] font-semibold text-[var(--ink)]">{r.equipmentName}</span>
            {r.submittedViaPublic && (
              <span className="rounded-md border border-[color-mix(in_oklch,var(--inspecao)_30%,transparent)] bg-[var(--inspecao-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--inspecao-ink)]">
                Público
              </span>
            )}
          </div>
          <p className="text-[12.5px] text-[var(--muted)]">
            {r.brand} · {r.model} ·{" "}
            <span className="font-mono-data text-[11.5px]">{r.serialNumber || "—"}</span>
          </p>
          <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5 font-mono-data text-[11.5px] text-[var(--faint)]">
            <span>{r.protocol}</span>
            {r.internalOs && <span>{r.internalOs}</span>}
          </div>
          <EquipmentThumbnails requestId={r.id} thumbnails={r.thumbnails ?? []} compact />
        </div>

        <div className="hidden pt-0.5 sm:block">
          <RequestStatusBadge status={r.status as RequestStatus} size="sm" />
        </div>
      </div>

      <div className="hidden min-w-0 pt-0.5 sm:block">
        <div className="gesteq-eyebrow mb-0.5">Setor</div>
        <div className="truncate text-[12.5px] text-[var(--ink-2)]">{r.usageSector}</div>
        <div className="mt-1 truncate text-xs text-[var(--muted)]">{requester}</div>
        {showSupplier && (
          <div className="mt-0.5 truncate text-xs text-[var(--faint)]">
            {r.supplier?.name ?? r.supplierName ?? "—"}
          </div>
        )}
      </div>

      <div className="hidden pt-0.5 sm:block">
        <ClassTag classe={r.equipmentClass} />
      </div>

      <div className="flex flex-wrap gap-1.5 sm:justify-end" onClick={(e) => e.stopPropagation()}>
        <ActionPill
          href={`/dashboard/engenharia/solicitacoes/${r.id}`}
          variant="primary"
          className="!h-8 !px-2.5 !text-xs"
        >
          Avaliar
          <ChevronRight className="h-3.5 w-3.5" />
        </ActionPill>
        <ActionPill
          href={`/equipamentos/${r.id}/cadastro`}
          variant="ghost"
          className="!h-8 !px-2.5 !text-xs"
          icon={<ClipboardList className="h-3.5 w-3.5" />}
        >
          EC
        </ActionPill>
        <ActionPill
          href={`/equipamentos/novo?from=${r.id}`}
          variant="blue"
          className="!h-8 !w-8 !p-0 justify-center"
          icon={<Copy className="h-3.5 w-3.5" />}
          title="Duplicar"
        >
          <span className="sr-only">Duplicar</span>
        </ActionPill>
      </div>

      <div className="flex items-center justify-between sm:hidden">
        <RequestStatusBadge status={r.status as RequestStatus} size="sm" />
        <span className="text-xs text-[var(--muted)]">{formatDate(r.plannedDate)}</span>
      </div>
    </div>
  );
}

export default function EquipamentosPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("TODOS");
  const [classe, setClasse] = useState<string>("TODAS");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["equipamentos"],
    queryFn: () =>
      fetch("/api/requests?queue=engenharia&thumbnails=1").then((r) => r.json()) as Promise<Row[]>,
  });

  const doctorOptions = useMemo(() => buildDoctorOptions(rows), [rows]);
  const supplierOptions = useMemo(() => buildSupplierOptions(rows), [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (status !== "TODOS" && r.status !== status) return false;
      if (classe !== "TODAS" && r.equipmentClass !== classe) return false;
      if (doctorFilter && !matchesDoctorFilter(r, doctorFilter)) return false;
      if (supplierFilter && !matchesSupplierFilter(r, supplierFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${r.serialNumber} ${r.equipmentName} ${r.protocol} ${r.internalOs ?? ""} ${r.doctor?.name ?? ""} ${r.requesterName ?? ""} ${r.supplierName} ${r.supplier?.name ?? ""} ${r.usageSector}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, status, classe, search, doctorFilter, supplierFilter]);

  const hasEntityFilter = !!(doctorFilter || supplierFilter);
  const liberados = rows.filter((r) => r.status === "LIBERADO").length;

  const filteredIds = useMemo(() => new Set(filtered.map((r) => r.id)), [filtered]);
  const selectedInView = [...selected].filter((id) => filteredIds.has(id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    if (selectedInView.length === filtered.length && filtered.length > 0) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((r) => next.add(r.id));
        return next;
      });
    }
  }

  async function downloadLabelsA4() {
    if (selectedInView.length === 0) return;
    setPrinting(true);
    setPrintError(null);
    try {
      const res = await fetch("/api/labels/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestIds: selectedInView }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Falha ao gerar PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `etiquetas-a4-${selectedInView.length}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setPrintError(e instanceof Error ? e.message : "Erro ao gerar etiquetas");
    } finally {
      setPrinting(false);
    }
  }

  return (
    <div className="gesteq-rise space-y-5">
      <PageHeader
        eyebrow="Engenharia Clínica"
        title="Equipamentos"
        subtitle={`${rows.length} equipamentos de terceiros · ${liberados} liberados`}
        actions={
          <Link href="/equipamentos/novo">
            <Button>
              <Plus className="h-4 w-4" /> Novo equipamento
            </Button>
          </Link>
        }
      />

      {/* Busca + filtros entidade */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1 sm:max-w-[380px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
          <Input
            className="h-10 border-[var(--line)] bg-[var(--surface)] pl-9"
            placeholder="Buscar série, OS, equipamento, médico, fornecedor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative min-w-[180px]">
          <Stethoscope className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--faint)]" />
          <select
            className={cn(
              "h-10 w-full cursor-pointer appearance-none rounded-[var(--r)] border border-[var(--line)] py-0 pl-8 pr-8 text-[13px]",
              doctorFilter ? "gesteq-filter-active" : "bg-[var(--surface)] text-[var(--ink)]"
            )}
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
          >
            <option value="">Todos os médicos</option>
            {doctorOptions.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--faint)]" />
        </div>
        <div className="relative min-w-[180px]">
          <Building2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--faint)]" />
          <select
            className={cn(
              "h-10 w-full cursor-pointer appearance-none rounded-[var(--r)] border border-[var(--line)] py-0 pl-8 pr-8 text-[13px]",
              supplierFilter ? "gesteq-filter-active" : "bg-[var(--surface)] text-[var(--ink)]"
            )}
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
          >
            <option value="">Todos os fornecedores</option>
            {supplierOptions.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--faint)]" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FilterPills
          label="Status"
          options={STATUS_OPTS}
          value={status}
          onChange={setStatus}
        />
        <FilterPills label="Classe ANVISA" options={CLASS_OPTS} value={classe} onChange={setClasse} />
      </div>

      {hasEntityFilter && (
        <div className="flex flex-wrap items-center gap-2 rounded-[var(--r-lg)] border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 py-2 text-sm text-[var(--brand-ink)]">
          <span className="font-medium">{filtered.length} equipamento(s)</span>
          {doctorFilter && (
            <span className="rounded-full border border-[var(--brand-line)] bg-[var(--surface)] px-2.5 py-0.5 text-xs">
              {labelFromFilterKey(doctorFilter, doctorOptions)}
            </span>
          )}
          {supplierFilter && (
            <span className="rounded-full border border-[var(--brand-line)] bg-[var(--surface)] px-2.5 py-0.5 text-xs">
              {labelFromFilterKey(supplierFilter, supplierOptions)}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setDoctorFilter("");
              setSupplierFilter("");
            }}
            className="ml-auto inline-flex items-center gap-1 text-xs hover:underline"
          >
            <X className="h-3.5 w-3.5" />
            Limpar filtros
          </button>
        </div>
      )}

      {/* Batch bar + tabela */}
      <div className="gesteq-card overflow-hidden">
        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-[var(--line-2)] bg-[var(--surface-2)] px-4 py-2.5">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--ink-2)]">
              <input
                type="checkbox"
                checked={selectedInView.length === filtered.length && filtered.length > 0}
                onChange={toggleAllVisible}
                className="h-[15px] w-[15px] accent-[var(--brand)]"
              />
              Selecionar visíveis ({filtered.length})
            </label>
            <Button size="sm" onClick={downloadLabelsA4} disabled={printing || selectedInView.length === 0}>
              {printing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
              Etiquetas A4 ({selectedInView.length})
            </Button>
            <span className="text-xs text-[var(--muted)]">
              Até {PER_PAGE} etiquetas por folha A4 (90×50 mm)
            </span>
            {printError && <span className="text-xs text-[var(--bloqueado-ink)]">{printError}</span>}
          </div>
        )}

        {/* Column headers — desktop */}
        <div className="hidden border-b border-[var(--line-2)] px-4 py-2 sm:grid sm:grid-cols-[28px_1.6fr_0.85fr_1fr_0.55fr_auto] sm:gap-4">
          <span />
          <span className="gesteq-eyebrow">Equipamento</span>
          <span className="gesteq-eyebrow">Status</span>
          <span className="gesteq-eyebrow">Setor / solicitante</span>
          <span className="gesteq-eyebrow">Classe</span>
          <span className="gesteq-eyebrow text-right">Ações</span>
        </div>

        {isLoading && (
          <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">Carregando...</p>
        )}

        {!isLoading &&
          filtered.map((r) => (
            <EquipRow
              key={r.id}
              r={r}
              selected={selected.has(r.id)}
              onSelect={() => toggleOne(r.id)}
              showSupplier={hasEntityFilter}
            />
          ))}

        {!isLoading && filtered.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-[var(--muted)]">
            Nenhum equipamento encontrado para os filtros.
          </p>
        )}
      </div>
    </div>
  );
}
