"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { RequestStatusBadge } from "@/components/requests/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { RequestStatus } from "@/lib/enums";
import { PageHeader } from "@/components/gesteq/page-header";
import { Panel } from "@/components/gesteq/panel";
import { Copy, ExternalLink } from "lucide-react";

export default function MedicoRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: request } = useQuery({
    queryKey: ["request", id],
    queryFn: () => fetch(`/api/requests/${id}`).then((r) => r.json()),
  });

  if (!request) return <p className="text-[var(--muted)]">Carregando...</p>;

  const supplierUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/fornecedor/${request.supplierToken}`
      : `/fornecedor/${request.supplierToken}`;

  return (
    <div className="gesteq-rise space-y-6">
      <PageHeader
        eyebrow="Médico"
        title={request.equipmentName}
        subtitle={`${request.protocol} · ${request.brand} ${request.model}`}
        actions={<RequestStatusBadge status={request.status as RequestStatus} />}
      />

      <Panel title="Dados da solicitação">
        <div className="space-y-2 text-sm text-[var(--ink-2)]">
          <p>
            <span className="text-[var(--muted)]">Setor:</span> {request.usageSector}
          </p>
          <p>
            <span className="text-[var(--muted)]">Procedimento:</span> {request.plannedProcedure}
          </p>
          <p>
            <span className="text-[var(--muted)]">Data prevista:</span> {formatDate(request.plannedDate)}
          </p>
        </div>
      </Panel>

      {request.supplierToken && (
        <Card>
          <CardContent className="space-y-2 py-4 text-sm">
            <p className="font-medium text-[var(--ink)]">Link para o fornecedor enviar documentos</p>
            <p className="break-all rounded-[var(--r-md)] bg-[var(--surface-2)] p-3 font-mono-data text-xs text-[var(--ink-2)]">
              {supplierUrl}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigator.clipboard?.writeText(supplierUrl)}
              >
                <Copy className="h-3.5 w-3.5" /> Copiar link
              </Button>
              <a href={supplierUrl} target="_blank" rel="noreferrer">
                <Button size="sm" variant="secondary">
                  <ExternalLink className="h-3.5 w-3.5" /> Abrir portal
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      <Link href={`/dashboard/medico/solicitacoes/${id}/documentos`}>
        <Button>Enviar documentação e fotos</Button>
      </Link>
    </div>
  );
}
