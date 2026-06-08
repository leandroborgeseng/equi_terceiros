"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestStatusBadge } from "@/components/requests/status-badge";
import type { RequestStatus } from "@/lib/enums";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/gesteq/page-header";

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
    <div className="gesteq-rise space-y-6">
      <PageHeader
        eyebrow="Assistencial"
        title="Centro Cirúrgico"
        subtitle="Equipamentos de terceiros liberados para uso no setor — consulta rápida pré-procedimento"
      />

      <div className="flex items-start gap-3 rounded-[var(--r-lg)] border border-[color-mix(in_oklch,var(--bloqueado)_30%,transparent)] bg-[var(--bloqueado-soft)] px-4 py-3 text-sm text-[var(--bloqueado-ink)]">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          <strong>Regra de segurança:</strong> nenhum equipamento de terceiro pode entrar em sala
          cirúrgica sem o status <strong>LIBERADO</strong> ou <strong>LIBERADO COM RESTRIÇÃO</strong>.
          Na dúvida, escaneie o QR Code da etiqueta para conferir o status atual.
        </p>
      </div>

      {isLoading && <p className="text-sm text-[var(--muted)]">Carregando...</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {requests.map((r) => {
          const restriction =
            r.technicalInspection?.restrictionNotes ??
            r.releaseStatus?.restrictionNotes;
          return (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{r.equipmentName}</CardTitle>
                  <RequestStatusBadge status={r.status as RequestStatus} />
                </div>
                <p className="font-mono-data text-xs text-[var(--muted)]">{r.protocol}</p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-[var(--muted)]">Marca/modelo:</span> {r.brand} {r.model}
                </p>
                <p>
                  <span className="text-[var(--muted)]">Setor:</span> {r.usageSector}
                </p>
                <p>
                  <span className="text-[var(--muted)]">Previsto:</span>{" "}
                  {new Date(r.plannedDate).toLocaleDateString("pt-BR")} às {r.plannedTime}
                </p>
                {restriction && (
                  <p className="flex items-start gap-1 rounded-lg bg-[var(--restricao-soft)] px-2 py-1 text-[var(--restricao-ink)]">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {restriction}
                  </p>
                )}
                {r.status === "LIBERADO" && (
                  <p className="flex items-center gap-1 text-[var(--brand-ink)]">
                    <CheckCircle2 className="h-4 w-4" /> Liberado para uso
                  </p>
                )}
                <Link
                  href={`/dashboard/engenharia/solicitacoes/${r.id}`}
                  className="inline-block text-[var(--brand-ink)] hover:underline"
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
          <CardContent className="py-12 text-center text-[var(--muted)]">
            Nenhum equipamento liberado no momento.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
