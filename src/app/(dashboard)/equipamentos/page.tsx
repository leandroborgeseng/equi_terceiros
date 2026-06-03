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
import { Search, Plus } from "lucide-react";

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
  doctor?: { name: string } | null;
  requesterName?: string | null;
  submittedViaPublic?: boolean;
  supplierName: string;
  plannedDate: string;
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

export default function EquipamentosPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("TODOS");
  const [classe, setClasse] = useState<string>("TODAS");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["equipamentos"],
    queryFn: () => fetch("/api/requests?queue=engenharia").then((r) => r.json()) as Promise<Row[]>,
  });

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (status !== "TODOS" && r.status !== status) return false;
      if (classe !== "TODAS" && r.equipmentClass !== classe) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${r.serialNumber} ${r.equipmentName} ${r.protocol} ${r.internalOs ?? ""} ${r.doctor?.name ?? ""} ${r.requesterName ?? ""} ${r.usageSector}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, status, classe, search]);

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
      </div>

      {isLoading && <p className="text-sm text-slate-500">Carregando...</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((r) => (
          <Card key={r.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{r.equipmentName}</p>
                  <p className="text-xs text-slate-500">
                    {r.brand} {r.model} · S/N {r.serialNumber || "—"}
                  </p>
                </div>
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
                )}{" "}
                · {formatDate(r.plannedDate)}
              </p>
              <div className="flex gap-3 pt-1 text-sm">
                <Link
                  href={`/equipamentos/${r.id}/cadastro`}
                  className="text-slate-600 hover:underline"
                >
                  Cadastro EC
                </Link>
                <Link
                  href={`/dashboard/engenharia/solicitacoes/${r.id}`}
                  className="text-emerald-700 hover:underline"
                >
                  Avaliar / detalhe
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
