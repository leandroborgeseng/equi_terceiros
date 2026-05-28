"use client";

import { useQuery } from "@tanstack/react-query";
import { RequestCard, type RequestCardData } from "@/components/requests/request-card";
import { Card, CardContent } from "@/components/ui/card";

const queueColumns = [
  { key: "aguardandoDocumentacao", label: "Aguardando doc.", color: "border-amber-200" },
  { key: "documentacaoEmAnalise", label: "Em análise", color: "border-blue-200" },
  { key: "pendenteComplemento", label: "Pendente complemento", color: "border-orange-200" },
  { key: "aguardandoInspecao", label: "Aguardando inspeção", color: "border-violet-200" },
  { key: "liberado", label: "Liberado", color: "border-emerald-200" },
  { key: "bloqueado", label: "Bloqueado", color: "border-red-200" },
  { key: "urgencia", label: "Urgência", color: "border-red-300" },
  { key: "vencido", label: "Vencido", color: "border-slate-300" },
] as const;

export default function EngenhariaDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetch("/api/dashboard/stats").then((r) => r.json()),
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["requests", "engenharia"],
    queryFn: () => fetch("/api/requests?queue=engenharia").then((r) => r.json()),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fila de Homologação</h1>
        <p className="text-slate-500">Engenharia Clínica — validação e liberação técnica</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {queueColumns.map((col) => (
          <Card key={col.key} className={col.color}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">
                {stats?.queue?.[col.key] ?? 0}
              </p>
              <p className="text-xs text-slate-600">{col.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-slate-800">Solicitações ativas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(requests as RequestCardData[]).map((r) => (
            <RequestCard
              key={r.id}
              request={{
                ...r,
                doctor: r.doctor ?? { name: "—" },
                plannedDate: String(r.plannedDate),
              }}
              href={`/dashboard/engenharia/solicitacoes/${r.id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
