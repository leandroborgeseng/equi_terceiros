"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { InvoiceLinkButton } from "@/components/ec/invoice-link-button";
import { ActionPill } from "@/components/gesteq/action-pill";
import { FlowPills } from "@/components/gesteq/flow-pills";
import { TabNav } from "@/components/gesteq/tab-nav";
import { ClassTag } from "@/components/gesteq/class-tag";
import { statusSpineBorderClass } from "@/lib/status-tokens";
import { cn } from "@/lib/utils";

type TabId = "resumo" | "documentos" | "termo" | "inspecao" | "ciclo" | "fotos";

const TABS = [
  { id: "resumo" as const, label: "Resumo", icon: Info },
  { id: "documentos" as const, label: "Documentos", icon: FileCheck },
  { id: "termo" as const, label: "Termo", icon: FileText },
  { id: "inspecao" as const, label: "Inspeção", icon: ClipboardCheck },
  { id: "ciclo" as const, label: "Ciclo de vida", icon: Package },
  { id: "fotos" as const, label: "Fotos", icon: Camera },
];

function InfoRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-[var(--line-2)] py-2.5 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="gesteq-eyebrow shrink-0">{label}</span>
      <span className="text-sm text-[var(--ink-2)] sm:text-right">{children ?? value ?? "—"}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="gesteq-rise animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-lg bg-[var(--line-2)]" />
      <div className="h-32 rounded-[var(--r-xl)] bg-[var(--line-2)]" />
      <div className="h-12 rounded-[var(--r-lg)] bg-[var(--line-2)]" />
      <div className="h-64 rounded-[var(--r-xl)] bg-[var(--line-2)]" />
    </div>
  );
}

const VALID_TABS: TabId[] = ["resumo", "documentos", "termo", "inspecao", "ciclo", "fotos"];

function initialTabFromUrl(param: string | null): TabId {
  if (param && VALID_TABS.includes(param as TabId)) return param as TabId;
  return "documentos";
}

export function RequestDetailView({ requestId }: { requestId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>(() => initialTabFromUrl(searchParams.get("tab")));

  const { data: request, isLoading } = useQuery({
    queryKey: ["request", requestId],
    queryFn: () => fetch(`/api/requests/${requestId}`).then((r) => r.json()),
  });

  const { data: gallery = [] } = useQuery({
    queryKey: ["gallery", requestId],
    queryFn: () => fetch(`/api/gallery/${requestId}`).then((r) => r.json()),
    enabled: !!requestId,
  });

  const invoiceId = request?.invoiceId ?? request?.invoice?.id;

  const { data: invoiceFile } = useQuery({
    queryKey: ["invoice-file", invoiceId],
    queryFn: async () => {
      const res = await fetch(`/api/invoices/${invoiceId}/file`);
      if (!res.ok) return null;
      return res.json() as Promise<{
        url: string;
        fileName: string | null;
        fileKey: string;
      } | null>;
    },
    enabled: !!invoiceId,
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

    const inv = request.invoice as {
      id: string;
      number: string;
      fileKey?: string | null;
      fileName?: string | null;
      previewUrl?: string | null;
    } | null;
    const invKey = inv?.fileKey ?? invoiceFile?.fileKey;
    const invUrl = inv?.fileKey
      ? fileUrlFromKey(inv.fileKey)
      : inv?.previewUrl ?? invoiceFile?.url;
    if (invKey && invUrl) {
      const invName = inv?.fileName ?? invoiceFile?.fileName ?? invKey.split("/").pop() ?? "nota-fiscal";
      add(
        {
          id: `invoice-${inv?.id ?? invoiceId}`,
          label: `NF ${inv?.number ?? "vinculada"}`,
          fileName: invName,
          url: invUrl,
          isImage: isImageFile(invName, invKey),
        },
        invKey
      );
    }

    return files;
  }, [request, gallery, invoiceFile, invoiceId]);

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

  const flowSteps = useMemo(() => {
    if (!workflow) return [];
    return [
      { id: "documentos", label: "Documentos", done: workflow.docsOk },
      { id: "termo", label: "Termo", done: workflow.termOk },
      { id: "inspecao", label: "Inspeção", done: !!workflow.inspOk },
      { id: "ciclo", label: "Liberação", done: workflow.released },
    ];
  }, [workflow]);

  if (isLoading || !request) return <LoadingSkeleton />;

  const status = request.status as RequestStatus;
  const classe = request.equipmentClass as EquipmentClass | null;
  const canDelete = DELETABLE_STATUSES.includes(request.status);

  const tabsWithBadge = TABS.map((t) => ({
    ...t,
    badge: t.id === "fotos" ? gallery.length : undefined,
  }));

  return (
    <div className="gesteq-rise pb-8">
      <Link
        href="/equipamentos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--brand-ink)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para equipamentos
      </Link>

      {/* Cabeçalho com status spine */}
      <div className={cn("gesteq-card relative overflow-hidden", statusSpineBorderClass(status))}>
        <div className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <p className="font-mono-data text-xs text-[var(--muted)]">
              {request.internalOs ?? request.protocol}
            </p>
            <h1 className="font-display mt-0.5 text-xl font-semibold leading-tight text-[var(--ink)] sm:text-2xl">
              {request.equipmentName}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {request.brand} {request.model}
              <span className="mx-2 text-[var(--line)]">·</span>
              S/N <span className="font-mono-data font-medium text-[var(--ink-2)]">{request.serialNumber || "—"}</span>
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {classe && <ClassTag classe={classe} />}
              <span className="inline-flex items-center rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--ink-2)]">
                {request.usageSector}
              </span>
              {request.isUrgent && (
                <span className="gesteq-badge gesteq-st-urgencia sm">
                  <span className="gesteq-dot" />
                  Urgência
                </span>
              )}
              {request.submittedViaPublic && (
                <span className="inline-flex items-center rounded-md border border-[color-mix(in_oklch,var(--inspecao)_30%,transparent)] bg-[var(--inspecao-soft)] px-2 py-0.5 text-xs font-medium text-[var(--inspecao-ink)]">
                  Solicitação pública
                </span>
              )}
            </div>
          </div>
          <RequestStatusBadge status={status} />
        </div>

        {/* Ações rápidas */}
        <div className="flex flex-wrap gap-2 border-t border-[var(--line-2)] px-4 py-3 sm:px-5">
          <ActionPill href={`/equipamentos/${requestId}/cadastro`} variant="slate">
            Cadastro EC
          </ActionPill>
          <ActionPill href={`/equipamentos/novo?from=${requestId}`} variant="blue" icon={<Copy className="h-3.5 w-3.5" />}>
            Duplicar
          </ActionPill>
          <QrButton qrToken={request.qrToken} variant="pill" />
          <PrintLabelButton
            variant="pill"
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
          <ActionPill
            href={`/api/terms/${requestId}`}
            variant="brand"
            icon={<FileText className="h-3.5 w-3.5" />}
          >
            PDF termo
          </ActionPill>
          <InvoiceLinkButton requestId={requestId} invoice={request.invoice} />
        </div>
      </div>

      {/* Fluxo de homologação */}
      {workflow && (
        <div className="gesteq-card mt-4 px-4 py-3 sm:px-5">
          <div className="gesteq-eyebrow mb-1">Fluxo de homologação</div>
          <FlowPills
            steps={flowSteps}
            activeId={tab === "resumo" || tab === "fotos" ? "documentos" : tab}
            onSelect={(id) => setTab(id as TabId)}
          />
          {!workflow.termOk && workflow.docsOk && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--pendente-ink)]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Documentos aprovados — registre o termo antes de liberar.
            </p>
          )}
        </div>
      )}

      {/* Abas */}
      <div className="mt-4">
        <TabNav tabs={tabsWithBadge} active={tab} onChange={setTab} />
      </div>

      {/* Conteúdo da aba */}
      <div className="mt-4">
        {tab === "resumo" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Anexos e fotos ({previewFiles.length})</CardTitle>
                <p className="text-sm text-[var(--muted)]">
                  Clique na miniatura para pré-visualizar PDF ou imagem.
                </p>
              </CardHeader>
              <CardContent>
                <FilePreviewGrid files={previewFiles} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Equipamento</CardTitle>
              </CardHeader>
              <CardContent>
                <InfoRow label="Marca / modelo" value={`${request.brand} ${request.model}`} />
                <InfoRow label="Nº de série" value={request.serialNumber} />
                <InfoRow label="Classe" value={classe ? EQUIPMENT_CLASS_LABELS[classe] : "—"} />
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
                <CardTitle>Solicitação</CardTitle>
              </CardHeader>
              <CardContent>
                <InfoRow label="Solicitante" value={request.doctor?.name ?? request.requesterName ?? "—"} />
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
                <CardTitle>Empresa (PJ)</CardTitle>
              </CardHeader>
              <CardContent>
                <InfoRow label="Razão social" value={request.supplierName} />
                <InfoRow label="CNPJ" value={request.ownerDocument} />
                <InfoRow label="Contato" value={request.ownerContact} />
                <InfoRow label="Nota fiscal">
                  {request.invoice ? (
                    <span>
                      NF {request.invoice.number}
                      {request.invoice.fileName ? ` · ${request.invoice.fileName}` : ""}
                    </span>
                  ) : (
                    <span className="text-[var(--faint)]">Não vinculada</span>
                  )}
                </InfoRow>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Origem</CardTitle>
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
              <Card className="border-[color-mix(in_oklch,var(--bloqueado)_25%,transparent)] bg-[var(--bloqueado-soft)] lg:col-span-2">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <p className="text-sm text-[var(--bloqueado-ink)]">
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
                    className="gesteq-pill gesteq-pill-ghost flex items-center gap-1 border-[color-mix(in_oklch,var(--bloqueado)_32%,transparent)] text-[var(--bloqueado-ink)] hover:bg-[var(--bloqueado-soft)] disabled:opacity-60"
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
                  <CardTitle>Pré-visualização dos anexos</CardTitle>
                </CardHeader>
                <CardContent>
                  <FilePreviewGrid files={previewFiles} />
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Checklist documental (Anexo II)</CardTitle>
                <p className="text-sm text-[var(--muted)]">
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
              <CardTitle>Termo de responsabilidade (Anexo IV)</CardTitle>
              <p className="text-sm text-[var(--muted)]">Obrigatório para liberação do equipamento.</p>
            </CardHeader>
            <CardContent>
              <TermPanel requestId={requestId} term={request.responsibilityTerm} ownerName={request.ownerName} />
            </CardContent>
          </Card>
        )}

        {tab === "inspecao" && (
          <Card>
            <CardHeader>
              <CardTitle>Inspeção técnica (Anexo III)</CardTitle>
              <p className="text-sm text-[var(--muted)]">
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
              <CardTitle>Ciclo de vida</CardTitle>
              <p className="text-sm text-[var(--muted)]">
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
              <CardTitle>Galeria de fotos</CardTitle>
              <p className="text-sm text-[var(--muted)]">
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
