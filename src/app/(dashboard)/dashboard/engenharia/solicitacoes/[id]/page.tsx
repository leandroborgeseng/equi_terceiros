"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { RequestStatusBadge } from "@/components/requests/status-badge";
import { ChecklistPanel } from "@/components/ec/checklist-panel";
import { InspectionPanel } from "@/components/ec/inspection-panel";
import { ImageGallery } from "@/components/gallery/image-gallery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { RequestStatus } from "@/lib/enums";

export default function EngenhariaRequestDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: request } = useQuery({
    queryKey: ["request", id],
    queryFn: () => fetch(`/api/requests/${id}`).then((r) => r.json()),
  });

  const { data: gallery = [] } = useQuery({
    queryKey: ["gallery", id],
    queryFn: () => fetch(`/api/gallery/${id}`).then((r) => r.json()),
    enabled: !!id,
  });

  if (!request) return <p className="text-slate-500">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-slate-500">{request.protocol}</p>
          <h1 className="text-2xl font-bold text-slate-900">
            {request.equipmentName} — {request.brand} {request.model}
          </h1>
          <p className="text-slate-500">S/N {request.serialNumber}</p>
        </div>
        <RequestStatusBadge status={request.status as RequestStatus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Dados clínicos e cadastro</CardTitle>
              <a
                href={`/equipamentos/${id}/cadastro`}
                className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Cadastro EC
              </a>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p><strong>Médico:</strong> {request.doctor?.name} — CRM {request.doctorCrm}</p>
            <p><strong>Paciente:</strong> {request.patientName} · Prontuário {request.medicalRecord}</p>
            <p><strong>Setor:</strong> {request.usageSector}</p>
            <p><strong>Procedimento:</strong> {request.plannedProcedure}</p>
            <p><strong>Previsto:</strong> {formatDate(request.plannedDate)} {request.plannedTime}</p>
            <p><strong>Fornecedor:</strong> {request.supplierName}</p>
            <p>
              <strong>Classe:</strong> {request.equipmentClass ?? "—"} ·{" "}
              <strong>Ingresso:</strong> {request.entryType} · <strong>OS:</strong>{" "}
              {request.internalOs ?? "não cadastrada"}
            </p>
            <p><strong>Enviado:</strong> {formatDateTime(request.submittedAt)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <ChecklistPanel requestId={id} checklist={request.documentChecklist} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <InspectionPanel requestId={id} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <ImageGallery
              images={gallery.map(
                (g: {
                  id: string;
                  url: string;
                  photoType: string;
                  fileName: string;
                  createdAt: string;
                  metadata?: Record<string, unknown> | null;
                }) => ({
                  ...g,
                  createdAt: String(g.createdAt),
                })
              )}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <a href={`/api/terms/${id}`} target="_blank" rel="noreferrer" className="text-sm text-emerald-600 hover:underline">
          Baixar termo de responsabilidade (PDF)
        </a>
        <a href={`/api/labels/${id}`} target="_blank" rel="noreferrer" className="text-sm text-emerald-600 hover:underline">
          Baixar etiqueta (PDF)
        </a>
      </div>
    </div>
  );
}
