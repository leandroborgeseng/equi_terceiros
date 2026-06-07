"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Copy,
  Trash2,
  FileCheck,
  FileText,
  ClipboardCheck,
  Package,
  Camera,
  Info,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";
import { RequestStatusBadge } from "@/components/requests/status-badge";
import { DELETABLE_STATUSES } from "@/lib/validators/request";
import { ChecklistPanel } from "@/components/ec/checklist-panel";
import { InspectionPanel } from "@/components/ec/inspection-panel";
import { LifecyclePanel } from "@/components/ec/lifecycle-panel";
import { TermPanel } from "@/components/ec/term-panel";
import { QrButton } from "@/components/ec/qr-button";
import { PrintLabelButton } from "@/components/ec/print-label-button";
import { ImageGallery } from "@/components/gallery/image-gallery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/utils";
import { ENTRY_TYPE_LABELS, EQUIPMENT_CLASS_LABELS, type RequestStatus, type EquipmentClass, type EntryType } from "@/lib/enums";
import { DOC_CHECKLIST_ITEMS } from "@/lib/validators/request";
import { FilePreviewGrid, type PreviewFile, isImageFile, fileUrlFromKey } from "@/components/ec/file-preview";

type TabId = "resumo" | "documentos" | "termo" | "inspecao" | "ciclo" | "fotos";

const TABS: { id: TabId; label: string; icon: typeof Info }[] = [
  { id: "resumo", label: "Resumo", icon: Info },
  { id: "documentos", label: "Documentos", icon: FileCheck },
  { id: "termo", label: "Termo", icon: FileText },
  { id: "inspecao", label: "Inspeção", icon: ClipboardCheck },
  { id: "ciclo", label: "Ciclo de vida", icon: Package },
  { id: "fotos", label: "Fotos", icon: Camera },
];

function InfoRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-2.5 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-sm text-slate-800 sm:text-right">{children ?? value ?? "—"}</span>
    </div>
  );
}

function StepPill({
  label,
  done,
  active,
  onClick,
}: {
  label: string;
  done: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : done
            ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5 opacity-50" />}
      {label}
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-lg bg-slate-200" />
      <div className="h-32 rounded-2xl bg-slate-200" />
      <div className="h-12 rounded-xl bg-slate-200" />
      <div className="h-64 rounded-2xl bg-slate-200" />
    </div>
  );
}

export function RequestDetailView({ requestId }: { requestId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>("documentos");

  const { data: request, isLoading } = useQuery({
    queryKey: ["request", requestId],
    queryFn: () => fetch(`/api/requests/${requestId}`).then((r) => r.json()),
  });

  const { data: gallery = [] } = useQuery({
    queryKey: ["gallery", requestId],
    queryFn: () => fetch(`/api/gallery/${requestId}`).then((r) => r.json()),
    enabled: !!requestId,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/requests/${requestId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao excluir");
      return data;
    },
    onSuccess: () => router.push("/equipamentos"),
  });

  const previewFiles = useMemo(() => {
    if (!request) return [] as PreviewFile[];
    const seen = new Set<string>();
    const files: PreviewFile[] = [];

    const add = (file: PreviewFile, storageKey?: string) => {
      const dedupe = storageKey ?? file.url;
      if (seen.has(dedupe)) return;
      seen.add(dedupe);
      files.push(file);
    };

    for (const g of gallery as { id: string; photoType: string; fileName: string; url: string }[]) {
      add(
        {
          id: `gallery-${g.id}`,
          label: g.photoType.replace(/_/g, " "),
          fileName: g.fileName,
          url: g.url,
          isImage: true,
        },
        g.url
      );
    }

    const checklist = request.documentChecklist as Record<string, string | null> | null;
    if (checklist) {
      for (const item of DOC_CHECKLIST_ITEMS) {
        const key = checklist[`${item.key}FileKey`];
        if (key) {
          const shortLabel = item.label.length > 40 ? `${item.label.slice(0, 40)}…` : item.label;
          add({
            id: `checklist-${item.key}`,
            label: shortLabel,
            fileName: key.split("/").pop()?.replace(/^\d+-/, "") ?? "documento",
            url: fileUrlFromKey(key),
            isImage: isImageFile(key),
          }, key);
        }
      }
    }

    for (const att of request.attachments ?? []) {
      add(
        {
          id: `att-${att.id}`,
          label: String(att.type).replace(/_/g, " "),
          fileName: att.fileName,
          url: fileUrlFromKey(att.storageKey),
          isImage: isImageFile(att.fileName, att.mimeType),
        },
        att.storageKey
      );
    }

    return files;
  }, [request, gallery]);

  const workflow = useMemo(() => {
    if (!request) return null;
    const docsOk = request.documentChecklist?.docStatus === "APROVADO";
    const termOk = !!request.responsibilityTerm?.accepted;
    const inspStatus = request.technicalInspection?.status;
    const inspOk = inspStatus && inspStatus !== "PENDENTE";
    const released = ["LIBERADO", "LIBERADO_COM_RESTRICAO", "EM_USO", "AGUARDANDO_RETIRADA", "RETIRADO"].includes(
      request.status
    );
    return { docsOk, termOk, inspOk, released, inspStatus };
  }, [request]);

  if (isLoading || !request) return <LoadingSkeleton />;

  const status = request.status as RequestStatus;
  const classe = request.equipmentClass as EquipmentClass | null;
  const canDelete = DELETABLE_STATUSES.includes(request.status);

  return (
    <div className="pb-8">
      {/* Navegação */}
      <Link
        href="/equipamentos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para equipamentos
      </Link>

      {/* Cabeçalho do equipamento */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs text-slate-500">
              {request.internalOs ?? request.protocol}
            </p>
            <h1 className="mt-0.5 text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
              {request.equipmentName}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {request.brand} {request.model}
              <span className="mx-2 text-slate-300">·</span>
              S/N <span className="font-medium">{request.serialNumber || "—"}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {classe && (
                <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-xs font-medium text-white">
                  Classe {classe}
                </span>
              )}
              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {request.usageSector}
              </span>
              {request.isUrgent && (
                <span className="rounded-lg bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  Urgência
                </span>
              )}
              {request.submittedViaPublic && (
                <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs text-blue-700">Solicitação pública</span>
              )}
            </div>
          </div>
          <RequestStatusBadge status={status} />
        </div>

        {/* Ações rápidas */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <Link
            href={`/equipamentos/${requestId}/cadastro`}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
          >
            Cadastro EC
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/equipamentos/novo?from=${requestId}`}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800 hover:bg-blue-100"
          >
            <Copy className="h-3.5 w-3.5" />
            Duplicar
          </Link>
          <QrButton qrToken={request.qrToken} />
          <PrintLabelButton
            requestId={requestId}
            qrToken={request.qrToken}
            status={request.releaseStatus?.labelStatus ?? "PENDENTE_ANALISE"}
            equipmentName={request.equipmentName}
            brand={request.brand}
            model={request.model}
            serialNumber={request.serialNumber}
            internalOs={request.internalOs ?? request.protocol}
            sector={request.usageSector}
            validUntil={request.validUntil ? formatDate(request.validUntil) : undefined}
            restriction={request.restrictionNotes ?? undefined}
          />
          <a
            href={`/api/terms/${requestId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
          >
            <FileText className="h-3.5 w-3.5" />
            PDF termo
          </a>
        </div>
      </div>

      {/* Fluxo de homologação — atalhos */}
      {workflow && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Fluxo de homologação
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <StepPill
              label="1. Documentos"
              done={workflow.docsOk}
              active={tab === "documentos"}
              onClick={() => setTab("documentos")}
            />
            <StepPill
              label="2. Termo"
              done={workflow.termOk}
              active={tab === "termo"}
              onClick={() => setTab("termo")}
            />
            <StepPill
              label="3. Inspeção"
              done={!!workflow.inspOk}
              active={tab === "inspecao"}
              onClick={() => setTab("inspecao")}
            />
            <StepPill
              label="4. Liberação"
              done={workflow.released}
              active={tab === "ciclo"}
              onClick={() => setTab("ciclo")}
            />
          </div>
          {!workflow.termOk && workflow.docsOk && (
            <p className="mt-2 flex items-center gap-1 text-xs text-amber-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Documentos aprovados — registre o termo antes de liberar.
            </p>
          )}
        </div>
      )}

      {/* Abas */}
      <div className="sticky top-16 z-20 -mx-4 mt-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:mx-0 sm:rounded-t-xl sm:px-0">
        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-thin">
          {TABS.map(({ id, label, icon: Icon }) => {
            const count = id === "fotos" ? gallery.length : 0;
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da aba */}
      <div className="mt-4">
        {tab === "resumo" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Anexos e fotos ({previewFiles.length})</CardTitle>
                <p className="text-sm text-slate-500">
                  Clique na miniatura para pré-visualizar PDF ou imagem.
                </p>
              </CardHeader>
              <CardContent>
                <FilePreviewGrid files={previewFiles} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Equipamento</CardTitle>
              </CardHeader>
              <CardContent>
                <InfoRow label="Marca / modelo" value={`${request.brand} ${request.model}`} />
                <InfoRow label="Nº de série" value={request.serialNumber} />
                <InfoRow
                  label="Classe"
                  value={classe ? EQUIPMENT_CLASS_LABELS[classe] : "—"}
                />
                <InfoRow
                  label="Tipo de ingresso"
                  value={ENTRY_TYPE_LABELS[request.entryType as EntryType] ?? request.entryType}
                />
                <InfoRow label="Setor" value={request.usageSector} />
                <InfoRow label="OS interna" value={request.internalOs ?? "Não cadastrada"} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Solicitação</CardTitle>
              </CardHeader>
              <CardContent>
                <InfoRow
                  label="Solicitante"
                  value={
                    request.doctor?.name ?? request.requesterName ?? "—"
                  }
                />
                {request.doctorCrm && <InfoRow label="CRM" value={request.doctorCrm} />}
                {request.submittedViaPublic && (
                  <>
                    <InfoRow label="E-mail" value={request.requesterEmail} />
                    <InfoRow label="Telefone" value={request.requesterPhone} />
                  </>
                )}
                <InfoRow label="Paciente" value={request.patientName || "—"} />
                <InfoRow label="Prontuário" value={request.medicalRecord || "—"} />
                <InfoRow label="Procedimento" value={request.plannedProcedure} />
                <InfoRow
                  label="Data prevista"
                  value={`${formatDate(request.plannedDate)} ${request.plannedTime}`}
                />
                <InfoRow label="Enviado em" value={formatDateTime(request.submittedAt)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Empresa (PJ)</CardTitle>
              </CardHeader>
              <CardContent>
                <InfoRow label="Razão social" value={request.supplierName} />
                <InfoRow label="CNPJ" value={request.ownerDocument} />
                <InfoRow label="Contato" value={request.ownerContact} />
                {request.invoice && (
                  <InfoRow label="Nota fiscal">
                    <Link href="/notas-fiscais" className="text-emerald-700 hover:underline">
                      NF {request.invoice.number}
                    </Link>
                    {request.invoice.fileName ? ` · ${request.invoice.fileName}` : ""}
                  </InfoRow>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Origem</CardTitle>
              </CardHeader>
              <CardContent>
                {request.originatedByEc && (
                  <InfoRow label="Cadastro" value="Originado pela Engenharia Clínica" />
                )}
                {request.alreadyInPark && (
                  <InfoRow label="Parque" value="Formalização — equipamento já em uso" />
                )}
                <InfoRow label="Protocolo" value={request.protocol} />
              </CardContent>
            </Card>

            {canDelete && (
              <Card className="border-red-100 bg-red-50/40 lg:col-span-2">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <p className="text-sm text-red-700">
                    Cadastro ainda não validado — pode ser excluído.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm("Excluir esta solicitação não validada? Esta ação não pode ser desfeita.")
                      ) {
                        deleteMutation.mutate();
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleteMutation.isPending ? "Excluindo..." : "Excluir solicitação"}
                  </button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {tab === "documentos" && (
          <div className="space-y-4">
            {previewFiles.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Pré-visualização dos anexos</CardTitle>
                </CardHeader>
                <CardContent>
                  <FilePreviewGrid files={previewFiles} />
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Checklist documental (Anexo II)</CardTitle>
                <p className="text-sm text-slate-500">
                  Marque Sim/Não/N/A, use o ícone para observação e anexe o comprovante.
                </p>
              </CardHeader>
              <CardContent>
                <ChecklistPanel requestId={requestId} checklist={request.documentChecklist} />
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "termo" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Termo de responsabilidade (Anexo IV)</CardTitle>
              <p className="text-sm text-slate-500">
                Obrigatório para liberação do equipamento.
              </p>
            </CardHeader>
            <CardContent>
              <TermPanel
                requestId={requestId}
                term={request.responsibilityTerm}
                ownerName={request.ownerName}
              />
            </CardContent>
          </Card>
        )}

        {tab === "inspecao" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inspeção técnica (Anexo III)</CardTitle>
              <p className="text-sm text-slate-500">
                Registre a inspeção física e o parecer de liberação.
              </p>
            </CardHeader>
            <CardContent>
              <InspectionPanel requestId={requestId} />
            </CardContent>
          </Card>
        )}

        {tab === "ciclo" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ciclo de vida</CardTitle>
              <p className="text-sm text-slate-500">
                Liberação, uso no setor, armazenamento e retirada.
              </p>
            </CardHeader>
            <CardContent>
              <LifecyclePanel
                requestId={requestId}
                status={request.status}
                storageRecords={request.storageRecords}
                withdrawalRecords={request.withdrawalRecords}
              />
            </CardContent>
          </Card>
        )}

        {tab === "fotos" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Galeria de fotos</CardTitle>
              <p className="text-sm text-slate-500">
                Fotos do equipamento e anexos visuais. Passe o mouse para excluir fotos incorretas.
              </p>
            </CardHeader>
            <CardContent>
              <ImageGallery
                canDelete
                onDeleted={() => queryClient.invalidateQueries({ queryKey: ["gallery", requestId] })}
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
        )}
      </div>
    </div>
  );
}
