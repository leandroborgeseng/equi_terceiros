"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/gesteq/page-header";
import { Panel } from "@/components/gesteq/panel";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Receipt, Paperclip, FileText, Link2, X, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { presignAndUpload } from "@/lib/upload-client";

type InvoiceRequest = {
  id: string;
  equipmentName: string;
  serialNumber: string;
  status: string;
  internalOs?: string | null;
};

type Invoice = {
  id: string;
  number: string;
  issueDate?: string | null;
  supplierName?: string | null;
  totalValue?: number | null;
  notes?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  createdAt: string;
  requests: InvoiceRequest[];
};

type LinkableRequest = {
  id: string;
  equipmentName: string;
  serialNumber: string;
  status: string;
  internalOs?: string | null;
  protocol: string;
  invoiceId?: string | null;
};

export default function NotasFiscaisPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ number: "", issueDate: "", supplierName: "", totalValue: "", notes: "" });
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [selectedToLink, setSelectedToLink] = useState<Record<string, string[]>>({});
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const createFileRef = useRef<HTMLInputElement | null>(null);

  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: () => fetch("/api/invoices").then((r) => r.json()),
  });

  const { data: allRequests = [] } = useQuery<LinkableRequest[]>({
    queryKey: ["equipamentos"],
    queryFn: () => fetch("/api/requests?queue=engenharia").then((r) => r.json()),
  });

  async function uploadFile(invoiceId: string, file: File) {
    const { storageKey } = await presignAndUpload({
      scopeId: invoiceId,
      type: "NOTA_FISCAL",
      file,
      fileName: file.name,
    });
    const res = await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileKey: storageKey, fileName: file.name }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Falha ao salvar arquivo da NF");
    }
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!createFile) throw new Error("Anexo da nota fiscal é obrigatório (PDF ou imagem)");

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: form.number,
          issueDate: form.issueDate || undefined,
          supplierName: form.supplierName || undefined,
          totalValue: form.totalValue || undefined,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar NF");

      try {
        await uploadFile(data.id, createFile);
      } catch (e) {
        await fetch(`/api/invoices/${data.id}`, { method: "DELETE" });
        throw e;
      }
      return data;
    },
    onSuccess: () => {
      setForm({ number: "", issueDate: "", supplierName: "", totalValue: "", notes: "" });
      setCreateFile(null);
      if (createFileRef.current) createFileRef.current.value = "";
      setError(null);
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  async function handleUpload(invoiceId: string, file: File) {
    setUploadingId(invoiceId);
    setError(null);
    try {
      await uploadFile(invoiceId, file);
      qc.invalidateQueries({ queryKey: ["invoices"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setUploadingId(null);
    }
  }

  async function openAttachment(invoiceId: string) {
    const res = await fetch(`/api/invoices/${invoiceId}/file`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Não foi possível abrir o anexo");
      return;
    }
    window.open(data.url, "_blank", "noopener,noreferrer");
  }

  const linkMutation = useMutation({
    mutationFn: async ({ invoiceId, requestIds }: { invoiceId: string; requestIds: string[] }) => {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkRequestIds: requestIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao vincular equipamentos");
      return data;
    },
    onSuccess: (_data, vars) => {
      setSelectedToLink((s) => ({ ...s, [vars.invoiceId]: [] }));
      setLinkingId(null);
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["equipamentos"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const unlinkMutation = useMutation({
    mutationFn: async ({ invoiceId, requestId }: { invoiceId: string; requestId: string }) => {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlinkRequestIds: [requestId] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao desvincular");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["equipamentos"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  function linkableFor(invoiceId: string) {
    return allRequests.filter((r) => !r.invoiceId || r.invoiceId === invoiceId);
  }

  function toggleSelect(invoiceId: string, requestId: string) {
    setSelectedToLink((s) => {
      const current = s[invoiceId] ?? [];
      const next = current.includes(requestId)
        ? current.filter((id) => id !== requestId)
        : [...current, requestId];
      return { ...s, [invoiceId]: next };
    });
  }

  return (
    <div className="gesteq-rise space-y-6">
      <PageHeader
        eyebrow="Documentação"
        title="Notas Fiscais"
        subtitle={`${(invoices ?? []).length} NFs · vários equipamentos podem compartilhar a mesma nota`}
      />

      <Panel
        title="Nova nota fiscal"
        eyebrow="Cadastro"
        right={<Receipt className="h-5 w-5 text-[var(--brand-ink)]" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Número da NF *</Label>
            <Input value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} />
          </div>
          <div>
            <Label>Data de emissão</Label>
            <Input type="date" value={form.issueDate} onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))} />
          </div>
          <div>
            <Label>Empresa (PJ)</Label>
            <Input value={form.supplierName} onChange={(e) => setForm((f) => ({ ...f, supplierName: e.target.value }))} />
          </div>
          <div>
            <Label>Valor total (R$)</Label>
            <Input type="number" step="0.01" value={form.totalValue} onChange={(e) => setForm((f) => ({ ...f, totalValue: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Label>Observações</Label>
            <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Label>Anexo da NF * (PDF ou imagem)</Label>
            <input
              ref={createFileRef}
              type="file"
              accept="application/pdf,image/*"
              className="mt-1 block w-full text-sm text-[var(--ink-2)] file:mr-3 file:rounded-[var(--r-md)] file:border-0 file:bg-[var(--brand-soft)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--brand-ink)]"
              onChange={(e) => setCreateFile(e.target.files?.[0] ?? null)}
            />
            {createFile && (
              <p className="mt-1 text-xs text-[var(--brand-ink)]">
                <FileText className="mr-1 inline h-3.5 w-3.5" />
                {createFile.name}
              </p>
            )}
          </div>
          {error && <p className="text-sm text-[var(--bloqueado-ink)] sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !form.number || !createFile}
            >
              {createMutation.isPending ? "Salvando..." : "Cadastrar nota fiscal"}
            </Button>
          </div>
        </div>
      </Panel>

      <div className="space-y-3">
        <h2 className="font-display font-semibold text-[var(--ink)]">Notas cadastradas</h2>
        {(invoices ?? []).length === 0 && (
          <p className="text-sm text-[var(--muted)]">Nenhuma nota fiscal cadastrada.</p>
        )}
        {(invoices ?? []).map((inv) => {
          const pending = selectedToLink[inv.id] ?? [];
          const candidates = linkableFor(inv.id).filter((r) => !inv.requests.some((x) => x.id === r.id));

          return (
            <Card key={inv.id}>
              <CardContent className="space-y-3 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-[var(--ink)]">
                      NF {inv.number}
                      {inv.issueDate ? (
                        <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                          emissão {formatDate(inv.issueDate)}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {inv.supplierName ?? "—"}
                      {inv.totalValue ? ` · R$ ${inv.totalValue.toFixed(2)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!inv.fileKey && <Badge variant="warning">Sem anexo</Badge>}
                    <Badge variant="info">{inv.requests.length} equipamento(s)</Badge>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <input
                    ref={(el) => {
                      fileInputs.current[inv.id] = el;
                    }}
                    type="file"
                    accept="application/pdf,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(inv.id, f);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputs.current[inv.id]?.click()}
                    disabled={uploadingId === inv.id}
                    className="flex items-center gap-1 rounded-[var(--r-md)] border border-[var(--line)] px-2 py-1 text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    {uploadingId === inv.id ? "Enviando..." : inv.fileKey ? "Trocar anexo" : "Anexar NF *"}
                  </button>
                  {inv.fileName && (
                    <>
                      <span className="flex items-center gap-1 text-[var(--brand-ink)]">
                        <FileText className="h-3.5 w-3.5" /> {inv.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={() => openAttachment(inv.id)}
                        className="flex items-center gap-1 rounded-[var(--r-md)] border border-[color-mix(in_oklch,var(--brand)_30%,transparent)] px-2 py-1 text-[var(--brand-ink)] hover:bg-[var(--brand-soft)]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Abrir
                      </button>
                    </>
                  )}
                </div>

                {inv.requests.length > 0 && (
                  <div className="rounded-[var(--r-md)] bg-[var(--surface-2)] p-2">
                    <p className="mb-1 text-xs font-medium text-[var(--ink-2)]">Equipamentos vinculados</p>
                    <ul className="space-y-1">
                      {inv.requests.map((r) => (
                        <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span>
                            <Link
                              href={`/dashboard/engenharia/solicitacoes/${r.id}`}
                              className="text-[var(--brand-ink)] hover:underline"
                            >
                              {r.equipmentName}
                            </Link>{" "}
                            <span className="text-[var(--muted)]">
                              · série {r.serialNumber || "—"}
                              {r.internalOs ? ` · ${r.internalOs}` : ""} · {r.status}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => unlinkMutation.mutate({ invoiceId: inv.id, requestId: r.id })}
                            disabled={unlinkMutation.isPending}
                            className="flex items-center gap-0.5 text-red-600 hover:underline"
                          >
                            <X className="h-3 w-3" /> Desvincular
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {inv.fileKey && (
                  <div className="rounded-[var(--r-md)] border border-[var(--line)] p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-[var(--ink)]">
                        <Link2 className="mr-1 inline h-3.5 w-3.5" />
                        Vincular mais equipamentos
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLinkingId(linkingId === inv.id ? null : inv.id)}
                      >
                        {linkingId === inv.id ? "Fechar" : "Selecionar"}
                      </Button>
                    </div>

                    {linkingId === inv.id && (
                      <div className="space-y-2">
                        {candidates.length === 0 ? (
                          <p className="text-xs text-[var(--muted)]">
                            Nenhum equipamento disponível (todos já estão em outra NF ou nesta).
                          </p>
                        ) : (
                          <ul className="max-h-48 space-y-1 overflow-y-auto rounded-[var(--r-md)] bg-[var(--surface-2)] p-2">
                            {candidates.map((r) => (
                              <li key={r.id}>
                                <label className="flex cursor-pointer items-start gap-2 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={pending.includes(r.id)}
                                    onChange={() => toggleSelect(inv.id, r.id)}
                                    className="mt-0.5"
                                  />
                                  <span>
                                    <strong className="text-[var(--ink)]">{r.equipmentName}</strong>
                                    <span className="text-[var(--muted)]">
                                      {" "}
                                      · {r.serialNumber || "s/n"} · {r.protocol}
                                      {r.invoiceId && r.invoiceId !== inv.id ? " · troca de NF" : ""}
                                    </span>
                                  </span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        )}
                        {pending.length > 0 && (
                          <Button
                            size="sm"
                            onClick={() => linkMutation.mutate({ invoiceId: inv.id, requestIds: pending })}
                            disabled={linkMutation.isPending}
                          >
                            {linkMutation.isPending
                              ? "Vinculando..."
                              : `Vincular ${pending.length} equipamento(s)`}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!inv.fileKey && (
                  <p className="text-xs text-[var(--restricao-ink)]">
                    Anexe o arquivo da NF para poder vincular equipamentos.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
