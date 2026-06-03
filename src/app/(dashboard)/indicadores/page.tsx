"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  A: "#7c3aed",
  B: "#2563eb",
  C: "#059669",
  D: "#dc2626",
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

  const kpis = [
    { label: "Equipamentos ativos", value: data?.totalAtivos ?? 0, icon: Activity, color: "text-blue-600" },
    { label: "Bloqueios no período", value: data?.bloqueios ?? 0, icon: XCircle, color: "text-red-600" },
    { label: "Eventos adversos", value: data?.eventosAdversos ?? 0, icon: AlertTriangle, color: "text-orange-600" },
    { label: "Pend. regularização", value: data?.pendentesRegularizacao ?? 0, icon: Clock, color: "text-amber-600" },
    { label: "Cadastro prévio (eletivos)", value: `${data?.cadastroPrevioPct ?? 0}%`, icon: CheckCircle, color: "text-emerald-600" },
    { label: "SLA homologação", value: `${data?.slaHoras ?? 0}h`, icon: Clock, color: "text-slate-600" },
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Indicadores estratégicos</h1>
          <p className="text-slate-500">Norma 445.000 — gestão de equipamentos de terceiros</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <FileDown className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPdf}>
            <FileDown className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              period === p.value ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {p.label}
          </button>
        ))}
        <select
          className="ml-auto rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <k.icon className={`h-9 w-9 ${k.color}`} />
              <div>
                <p className="text-2xl font-bold">{k.value}</p>
                <p className="text-xs text-slate-500">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipamentos por classe</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart
            data={(data?.porClasse ?? []).map((c) => ({
              label: `Classe ${c.classe}`,
              value: c.total,
              color: CLASS_COLORS[c.classe] ?? "#94a3b8",
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
