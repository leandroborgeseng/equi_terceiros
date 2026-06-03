"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { RequestStatusBadge } from "@/components/requests/status-badge";
import type { RequestStatus } from "@/lib/enums";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, Clock } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pendências</h1>
        <p className="text-slate-500">Itens aguardando ação da Engenharia Clínica</p>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Carregando...</p>}

      <div className="space-y-3">
        {rows.map((r) => {
          const overdue =
            r.regularizationDueAt && !r.regularizedAt && new Date(r.regularizationDueAt) < new Date();
          return (
            <Card key={r.id} className={overdue ? "border-red-200" : ""}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    {overdue ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-600" />
                    )}
                    <p className="font-medium text-slate-900">{r.equipmentName}</p>
                    <RequestStatusBadge status={r.status as RequestStatus} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {r.protocol} · {r.usageSector}
                    {r.flowType === "URGENCIA" && r.regularizationDueAt && (
                      <> · Regularizar até {formatDate(r.regularizationDueAt)}</>
                    )}
                  </p>
                </div>
                <Link
                  href={`/dashboard/engenharia/solicitacoes/${r.id}`}
                  className="text-sm text-emerald-700 hover:underline"
                >
                  Resolver
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!isLoading && rows.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Nenhuma pendência aberta. 🎉
          </CardContent>
        </Card>
      )}
    </div>
  );
}
