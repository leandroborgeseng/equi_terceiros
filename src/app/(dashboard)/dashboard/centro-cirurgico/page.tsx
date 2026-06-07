"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestStatusBadge } from "@/components/requests/status-badge";
import type { RequestStatus } from "@/lib/enums";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

type RequestRow = {
  id: string;
  protocol: string;
  equipmentName: string;
  brand: string;
  model: string;
  usageSector: string;
  plannedDate: string;
  plannedTime: string;
  status: string;
  releaseStatus?: { restrictionNotes?: string | null } | null;
  technicalInspection?: { restrictionNotes?: string | null } | null;
};

export default function CentroCirurgicoPage() {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests", "liberados"],
    queryFn: () =>
      fetch("/api/requests?queue=liberados").then((r) => r.json()) as Promise<RequestRow[]>,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Centro Cirúrgico</h1>
        <p className="text-slate-500">
          Equipamentos de terceiros liberados para uso no setor — consulta rápida pré-procedimento.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          <strong>Regra de segurança:</strong> nenhum equipamento de terceiro pode entrar em sala
          cirúrgica sem o status <strong>LIBERADO</strong> ou <strong>LIBERADO COM RESTRIÇÃO</strong>.
          Na dúvida, escaneie o QR Code da etiqueta para conferir o status atual.
        </p>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Carregando...</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {requests.map((r) => {
          const restriction =
            r.technicalInspection?.restrictionNotes ??
            r.releaseStatus?.restrictionNotes;
          return (
            <Card key={r.id} className="border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{r.equipmentName}</CardTitle>
                  <RequestStatusBadge status={r.status as RequestStatus} />
                </div>
                <p className="text-xs text-slate-500">{r.protocol}</p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-slate-500">Marca/modelo:</span> {r.brand} {r.model}
                </p>
                <p>
                  <span className="text-slate-500">Setor:</span> {r.usageSector}
                </p>
                <p>
                  <span className="text-slate-500">Previsto:</span>{" "}
                  {new Date(r.plannedDate).toLocaleDateString("pt-BR")} às {r.plannedTime}
                </p>
                {restriction && (
                  <p className="flex items-start gap-1 rounded-lg bg-orange-50 px-2 py-1 text-orange-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {restriction}
                  </p>
                )}
                {r.status === "LIBERADO" && (
                  <p className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Liberado para uso
                  </p>
                )}
                <Link
                  href={`/dashboard/engenharia/solicitacoes/${r.id}`}
                  className="inline-block text-emerald-700 hover:underline"
                >
                  Ver detalhes / galeria
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!isLoading && requests.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Nenhum equipamento liberado no momento.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
