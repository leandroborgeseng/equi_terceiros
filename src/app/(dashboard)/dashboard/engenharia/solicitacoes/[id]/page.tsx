"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { RequestStatusBadge } from "@/components/requests/status-badge";
import { DELETABLE_STATUSES } from "@/lib/validators/request";
import { Trash2 } from "lucide-react";
import { ChecklistPanel } from "@/components/ec/checklist-panel";
import { InspectionPanel } from "@/components/ec/inspection-panel";
import { ImageGallery } from "@/components/gallery/image-gallery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { RequestStatus } from "@/lib/enums";

export default function EngenhariaRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: request } = useQuery({
    queryKey: ["request", id],
    queryFn: () => fetch(`/api/requests/${id}`).then((r) => r.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/requests/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao excluir");
      return data;
    },
    onSuccess: () => router.push("/equipamentos"),
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
            <p>
              <strong>Solicitante:</strong> {request.doctor?.name ?? request.requesterName ?? "—"}
              {request.doctorCrm ? ` — CRM ${request.doctorCrm}` : ""}
              {request.submittedViaPublic && (
                <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">
                  público
                </span>
              )}
            </p>
            {request.submittedViaPublic && (
              <p className="text-xs text-slate-500">
                {request.requesterEmail} · {request.requesterPhone}
                {request.accessInvite?.key ? ` · chave ${request.accessInvite.key}` : ""}
              </p>
            )}
            {(request.originatedByEc || request.alreadyInPark) && (
              <p className="flex flex-wrap gap-2">
                {request.originatedByEc && (
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700">
                    cadastrado pela EC
                  </span>
                )}
                {request.alreadyInPark && (
                  <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">
                    formalização — já no parque
                  </span>
                )}
              </p>
            )}
            <p><strong>Paciente:</strong> {request.patientName || "—"} · Prontuário {request.medicalRecord || "—"}</p>
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

      {DELETABLE_STATUSES.includes(request.status) && (
        <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/50 px-4 py-3">
          <p className="text-sm text-red-700">
            Cadastro ainda não validado — pode ser excluído.
          </p>
          <button
            type="button"
            onClick={() => {
              if (confirm("Excluir esta solicitação não validada? Esta ação não pode ser desfeita.")) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      )}
    </div>
  );
}
