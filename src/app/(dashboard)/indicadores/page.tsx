"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/gesteq/page-header";
import { StatCard } from "@/components/gesteq/stat-card";
import { FilterPills } from "@/components/gesteq/filter-pills";
import { Panel } from "@/components/gesteq/panel";
import { StatusBars } from "@/components/gesteq/status-bars";
import { DonutChart } from "@/components/charts/donut-chart";
import { CheckCircle, XCircle, AlertTriangle, Clock, Activity, FileDown } from "lucide-react";
import { jsPDF } from "jspdf";

type Indicators = {
  period: string;
  totalAtivos: number;
  bloqueios: number;
  eventosAdversos: number;
  pendentesRegularizacao: number;
  cadastroPrevioPct: number;
  slaHoras: number;
  porClasse: { classe: string; total: number }[];
  setores: string[];
};

const PERIODS = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "12m", label: "12 meses" },
  { value: "all", label: "Tudo" },
];

const CLASS_COLORS: Record<string, string> = {
  A: "var(--brand)",
  B: "var(--inspecao)",
  C: "var(--citrus)",
  D: "var(--urgencia)",
};

export default function IndicadoresPage() {
  const [period, setPeriod] = useState("30d");
  const [sector, setSector] = useState("");

  const { data } = useQuery({
    queryKey: ["indicators", period, sector],
    queryFn: () =>
      fetch(
        `/api/indicators?period=${period}${sector ? `&sector=${encodeURIComponent(sector)}` : ""}`
      ).then((r) => r.json()) as Promise<Indicators>,
  });

  const { data: dashStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetch("/api/dashboard/stats").then((r) => r.json()),
  });

  const statusBars = [
    { label: "Aguard. docs", value: dashStats?.queue?.aguardandoDocumentos ?? 0, cls: "docs" },
    { label: "Pendentes", value: dashStats?.queue?.pendenteDocumentos ?? 0, cls: "pendente" },
    { label: "Inspeção", value: dashStats?.queue?.aguardandoInspecao ?? 0, cls: "inspecao" },
    { label: "Liberados", value: dashStats?.queue?.liberado ?? 0, cls: "liberado" },
    { label: "Bloqueados", value: dashStats?.queue?.bloqueado ?? 0, cls: "bloqueado" },
    { label: "Urgência", value: dashStats?.queue?.urgencia ?? 0, cls: "urgencia" },
  ];

  const kpis = [
    { label: "Equipamentos ativos", value: data?.totalAtivos ?? 0, icon: Activity, accent: "inspecao" as const },
    { label: "Bloqueios no período", value: data?.bloqueios ?? 0, icon: XCircle, accent: "bloqueado" as const },
    { label: "Eventos adversos", value: data?.eventosAdversos ?? 0, icon: AlertTriangle, accent: "pendente" as const },
    { label: "Pend. regularização", value: data?.pendentesRegularizacao ?? 0, icon: Clock, accent: "pendente" as const },
    { label: "Cadastro prévio (eletivos)", value: `${data?.cadastroPrevioPct ?? 0}%`, icon: CheckCircle, accent: "brand" as const },
    { label: "SLA homologação", value: `${data?.slaHoras ?? 0}h`, icon: Clock, accent: "muted" as const },
  ];

  function rows(): [string, string | number][] {
    return [
      ["Período", period],
      ["Setor", sector || "Todos"],
      ["Equipamentos ativos", data?.totalAtivos ?? 0],
      ["Bloqueios no período", data?.bloqueios ?? 0],
      ["Eventos adversos", data?.eventosAdversos ?? 0],
      ["Pendências de regularização", data?.pendentesRegularizacao ?? 0],
      ["% cadastro prévio (eletivos)", `${data?.cadastroPrevioPct ?? 0}%`],
      ["SLA homologação (h)", data?.slaHoras ?? 0],
      ...(data?.porClasse ?? []).map(
        (c) => [`Classe ${c.classe}`, c.total] as [string, number]
      ),
    ];
  }

  function exportCsv() {
    const csv = ["Indicador;Valor", ...rows().map(([k, v]) => `${k};${v}`)].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gesteq-indicadores-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPdf() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("GestEq — Relatório de Indicadores", 20, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 20, 28);
    let y = 42;
    for (const [k, v] of rows()) {
      doc.text(`${k}:`, 20, y);
      doc.text(String(v), 120, y);
      y += 8;
    }
    doc.save(`gesteq-indicadores-${period}.pdf`);
  }

  return (
    <div className="gesteq-rise space-y-6">
      <PageHeader
        eyebrow="Gestão"
        title="Indicadores estratégicos"
        subtitle="Norma 445.000 — gestão de equipamentos de terceiros"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <FileDown className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportPdf}>
              <FileDown className="h-4 w-4" /> PDF
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-4">
        <FilterPills
          label="Período"
          options={PERIODS.map((p) => ({ value: p.value, label: p.label }))}
          value={period}
          onChange={setPeriod}
        />
        <div className="ml-auto min-w-[200px]">
          <div className="gesteq-eyebrow mb-1.5">Setor</div>
          <select
            className="h-10 w-full rounded-[var(--r)] border border-[var(--line)] bg-[var(--surface)] px-3 text-sm"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          >
            <option value="">Todos os setores</option>
            {(data?.setores ?? []).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} icon={k.icon} accent={k.accent} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Distribuição por classe" eyebrow="NP 445.000">
          <DonutChart
            data={(data?.porClasse ?? []).map((c) => ({
              label: `Classe ${c.classe}`,
              value: c.total,
              color: CLASS_COLORS[c.classe] ?? "var(--faint)",
            }))}
          />
        </Panel>
        <Panel title="Equipamentos por status" eyebrow="Pipeline atual">
          <StatusBars items={statusBars} />
        </Panel>
      </div>
    </div>
  );
}
