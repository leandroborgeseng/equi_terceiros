"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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

const STATUS_FILTERS = [
  "TODOS",
  "AGUARDANDO_CADASTRO",
  "AGUARDANDO_DOCUMENTOS",
  "PENDENTE_DOCUMENTOS",
  "AGUARDANDO_INSPECAO",
  "LIBERADO",
  "BLOQUEADO",
  "FLUXO_URGENCIA",
] as const;

const PER_PAGE = labelsPerA4Page();

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Equipamentos</h1>
          <p className="text-slate-500">Rastreabilidade e fila da Engenharia Clínica</p>
        </div>
        <Link href="/equipamentos/novo">
          <Button>
            <Plus className="h-4 w-4" /> Novo equipamento
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Buscar por série, OS, equipamento, médico ou setor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                status === s ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {s === "TODOS" ? "Todos" : s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {["TODAS", "A", "B", "C", "D"].map((c) => (
            <button
              key={c}
              onClick={() => setClasse(c)}
              className={`rounded-lg px-3 py-1 text-xs font-medium ${
                classe === c ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {c === "TODAS" ? "Todas as classes" : `Classe ${c}`}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Stethoscope className="h-3.5 w-3.5" />
              Médico / solicitante
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
            >
              <option value="">Todos</option>
              {doctorOptions.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Building2 className="h-3.5 w-3.5" />
              Fornecedor (PJ)
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <option value="">Todos</option>
              {supplierOptions.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {hasEntityFilter && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-sm text-emerald-900">
            <span className="font-medium">
              {filtered.length} equipamento(s)
            </span>
            {doctorFilter && (
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs ring-1 ring-emerald-200">
                {labelFromFilterKey(doctorFilter, doctorOptions)}
              </span>
            )}
            {supplierFilter && (
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs ring-1 ring-emerald-200">
                {labelFromFilterKey(supplierFilter, supplierOptions)}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setDoctorFilter("");
                setSupplierFilter("");
              }}
              className="ml-auto inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline"
            >
              <X className="h-3.5 w-3.5" />
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={selectedInView.length === filtered.length && filtered.length > 0}
              onChange={toggleAllVisible}
              className="rounded"
            />
            Selecionar visíveis ({filtered.length})
          </label>
          <Button
            size="sm"
            onClick={downloadLabelsA4}
            disabled={printing || selectedInView.length === 0}
          >
            {printing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            Etiquetas A4 ({selectedInView.length})
          </Button>
          <span className="text-xs text-slate-500">
            Até {PER_PAGE} etiquetas por folha A4 (90×50 mm). Imprima e recorte nas linhas cinza.
          </span>
          {printError && <span className="text-xs text-red-600">{printError}</span>}
        </div>
      )}

      {isLoading && <p className="text-sm text-slate-500">Carregando...</p>}

      <div className={`grid gap-3 ${hasEntityFilter ? "lg:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2"}`}>
        {filtered.map((r) => (
          <Card key={r.id} className={hasEntityFilter ? "overflow-hidden" : undefined}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <label className="mt-1 flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggleOne(r.id)}
                    className="mt-1 rounded"
                    aria-label={`Selecionar ${r.equipmentName}`}
                  />
                <div>
                  <p className="font-medium text-slate-900">{r.equipmentName}</p>
                  <p className="text-xs text-slate-500">
                    {r.brand} {r.model} · S/N {r.serialNumber || "—"}
                  </p>
                </div>
                </label>
                <RequestStatusBadge status={r.status as RequestStatus} />
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded bg-slate-100 px-2 py-0.5">{r.protocol}</span>
                {r.internalOs && <span className="rounded bg-slate-100 px-2 py-0.5">{r.internalOs}</span>}
                {r.equipmentClass && (
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-white">Classe {r.equipmentClass}</span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {r.usageSector} · {r.doctor?.name ?? r.requesterName ?? "—"}
                {r.submittedViaPublic && (
                  <span className="ml-1 rounded bg-blue-50 px-1 text-blue-700">público</span>
                )}
                {hasEntityFilter && (
                  <>
                    {" "}
                    · {r.supplier?.name ?? r.supplierName ?? "—"}
                  </>
                )}{" "}
                · {formatDate(r.plannedDate)}
              </p>
              <EquipmentThumbnails
                requestId={r.id}
                thumbnails={r.thumbnails ?? []}
                max={hasEntityFilter ? 6 : 4}
              />
              <div className="flex flex-wrap gap-2 pt-2">
                <Link
                  href={`/dashboard/engenharia/solicitacoes/${r.id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-500"
                >
                  Avaliar / detalhe
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/equipamentos/${r.id}/cadastro`}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  Cadastro EC
                </Link>
                <Link
                  href={`/equipamentos/novo?from=${r.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800 hover:bg-blue-100"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicar
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Nenhum equipamento encontrado para os filtros.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
