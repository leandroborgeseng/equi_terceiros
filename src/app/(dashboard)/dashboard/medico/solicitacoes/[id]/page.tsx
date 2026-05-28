"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { RequestStatusBadge } from "@/components/requests/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { RequestStatus } from "@/lib/enums";

export default function MedicoRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: request } = useQuery({
    queryKey: ["request", id],
    queryFn: () => fetch(`/api/requests/${id}`).then((r) => r.json()),
  });

  if (!request) return <p>Carregando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-sm text-slate-500">{request.protocol}</p>
          <h1 className="text-xl font-bold">{request.equipmentName}</h1>
        </div>
        <RequestStatusBadge status={request.status as RequestStatus} />
      </div>
      <Card>
        <CardContent className="space-y-2 pt-6 text-sm text-slate-600">
          <p>Setor: {request.usageSector}</p>
          <p>Procedimento: {request.plannedProcedure}</p>
          <p>Data: {formatDate(request.plannedDate)}</p>
          {request.supplierToken && (
            <p className="break-all rounded-lg bg-slate-50 p-3 font-mono text-xs">
              Link fornecedor: {typeof window !== "undefined" ? `${window.location.origin}/fornecedor/${request.supplierToken}` : `/fornecedor/${request.supplierToken}`}
            </p>
          )}
        </CardContent>
      </Card>
      <Link href={`/dashboard/medico/solicitacoes/${id}/documentos`}>
        <Button>Enviar documentação e fotos</Button>
      </Link>
    </div>
  );
}
