"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/gesteq/page-header";
import { StatCard } from "@/components/gesteq/stat-card";
import { Panel } from "@/components/gesteq/panel";

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
    { label: "Liberados", value: stats?.liberados ?? 0, icon: CheckCircle, accent: "brand" as const },
    { label: "Pendentes", value: stats?.pendentes ?? 0, icon: Clock, accent: "pendente" as const },
    { label: "Bloqueados", value: stats?.bloqueados ?? 0, icon: XCircle, accent: "bloqueado" as const },
    { label: "Vencidos", value: stats?.vencidos ?? 0, icon: AlertTriangle, accent: "pendente" as const },
  ];

  return (
    <div className="gesteq-rise space-y-6">
      <PageHeader
        eyebrow="Diretoria"
        title="Dashboard Executivo"
        subtitle="Indicadores de homologação e compliance"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} icon={k.icon} accent={k.accent} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Panel title="SLA homologação" eyebrow="Média">
          <p className="font-display text-3xl font-semibold text-[var(--ink)]">
            {stats?.slaHomologacaoHoras ?? 0}h
          </p>
        </Panel>
        <Panel title="Taxa reprovação docs" eyebrow="Período">
          <p className="font-display text-3xl font-semibold text-[var(--ink)]">
            {stats?.taxaReprovacao ?? 0}%
          </p>
        </Panel>
        <Panel title="Docs vencidos" eyebrow="Alertas">
          <p className="font-display text-3xl font-semibold text-[var(--ink)]">
            {stats?.documentosVencidos ?? 0}
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Pendências por fornecedor" eyebrow="Top">
          <ul className="space-y-2 text-sm text-[var(--ink-2)]">
            {(stats?.porFornecedor ?? []).slice(0, 8).map((f) => (
              <li key={f.supplierName} className="flex justify-between gap-2">
                <span className="truncate">{f.supplierName}</span>
                <span className="font-mono-data font-semibold">{f._count}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Solicitações por médico" eyebrow="Ativos">
          <ul className="space-y-2 text-sm text-[var(--ink-2)]">
            {(stats?.porMedico ?? []).slice(0, 8).map((m) => (
              <li key={m.doctorId ?? "—"} className="flex justify-between gap-2">
                <span className="truncate">{m.doctorId ?? "Sem médico"}</span>
                <span className="font-mono-data font-semibold">{m._count}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
