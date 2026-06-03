"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

type Stats = {
  liberados: number;
  pendentes: number;
  bloqueados: number;
  vencidos: number;
  taxaReprovacao: number;
  slaHomologacaoHoras: number;
  documentosVencidos: number;
  porFornecedor: { supplierName: string; _count: number }[];
  porMedico: { doctorId: string; _count: number }[];
};

export default function ExecutivoDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetch("/api/dashboard/stats").then((r) => r.json()) as Promise<Stats>,
  });

  const kpis = [
    { label: "Liberados", value: stats?.liberados ?? 0, icon: CheckCircle, color: "text-emerald-600" },
    { label: "Pendentes", value: stats?.pendentes ?? 0, icon: Clock, color: "text-amber-600" },
    { label: "Bloqueados", value: stats?.bloqueados ?? 0, icon: XCircle, color: "text-red-600" },
    { label: "Vencidos", value: stats?.vencidos ?? 0, icon: AlertTriangle, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Executivo</h1>
        <p className="text-slate-500">Indicadores de homologação e compliance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <k.icon className={`h-10 w-10 ${k.color}`} />
              <div>
                <p className="text-3xl font-bold">{k.value}</p>
                <p className="text-sm text-slate-500">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> SLA Homologação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-emerald-600">{stats?.slaHomologacaoHoras ?? 0}h</p>
            <p className="text-sm text-slate-500">Tempo médio até homologação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Taxa de reprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-amber-600">{stats?.taxaReprovacao ?? 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Documentos vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-600">{stats?.documentosVencidos ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pendências por fornecedor</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {(stats?.porFornecedor ?? []).slice(0, 10).map((row) => (
                <li key={row.supplierName} className="flex justify-between border-b border-slate-100 py-2">
                  <span>{row.supplierName || "—"}</span>
                  <span className="font-semibold text-amber-700">{row._count}</span>
                </li>
              ))}
              {!stats?.porFornecedor?.length && (
                <p className="text-slate-500">Sem pendências por fornecedor.</p>
              )}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Solicitações abertas por médico</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {(stats?.porMedico ?? []).slice(0, 10).map((row) => (
                <li key={row.doctorId} className="flex justify-between border-b border-slate-100 py-2">
                  <span className="text-slate-600">ID {row.doctorId.slice(0, 8)}…</span>
                  <span className="font-semibold">{row._count}</span>
                </li>
              ))}
              {!stats?.porMedico?.length && (
                <p className="text-slate-500">Sem dados agregados.</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
