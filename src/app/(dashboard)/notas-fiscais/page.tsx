"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Receipt, Paperclip, FileText } from "lucide-react";
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

export default function NotasFiscaisPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ number: "", issueDate: "", supplierName: "", totalValue: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: () => fetch("/api/invoices").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
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
      return data;
    },
    onSuccess: () => {
      setForm({ number: "", issueDate: "", supplierName: "", totalValue: "", notes: "" });
      setError(null);
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  async function uploadFile(invoiceId: string, file: File) {
    setUploadingId(invoiceId);
    setError(null);
    try {
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
      if (!res.ok) throw new Error("Falha ao salvar arquivo da NF");
      qc.invalidateQueries({ queryKey: ["invoices"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notas Fiscais</h1>
        <p className="text-sm text-slate-500">
          Uma NF pode ser compartilhada por vários equipamentos. Cadastre a nota, anexe o arquivo e
          vincule os equipamentos no cadastro de cada um.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-600" /> Nova nota fiscal
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Número da NF *</Label>
            <Input value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} />
          </div>
          <div>
            <Label>Data de emissão</Label>
            <Input type="date" value={form.issueDate} onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))} />
          </div>
          <div>
            <Label>Fornecedor / empresa</Label>
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
          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Salvando..." : "Cadastrar nota fiscal"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-semibold text-slate-900">Notas cadastradas</h2>
        {(invoices ?? []).length === 0 && (
          <p className="text-sm text-slate-500">Nenhuma nota fiscal cadastrada.</p>
        )}
        {(invoices ?? []).map((inv) => (
          <Card key={inv.id}>
            <CardContent className="space-y-3 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">
                    NF {inv.number}
                    {inv.issueDate ? (
                      <span className="ml-2 text-xs font-normal text-slate-500">
                        emissão {formatDate(inv.issueDate)}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500">
                    {inv.supplierName ?? "—"}
                    {inv.totalValue ? ` · R$ ${inv.totalValue.toFixed(2)}` : ""}
                  </p>
                </div>
                <Badge variant="info">{inv.requests.length} equipamento(s)</Badge>
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
                    if (f) uploadFile(inv.id, f);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputs.current[inv.id]?.click()}
                  disabled={uploadingId === inv.id}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  {uploadingId === inv.id ? "Enviando..." : inv.fileKey ? "Trocar arquivo" : "Anexar NF"}
                </button>
                {inv.fileName && (
                  <span className="flex items-center gap-1 text-emerald-700">
                    <FileText className="h-3.5 w-3.5" /> {inv.fileName}
                  </span>
                )}
              </div>

              {inv.requests.length > 0 && (
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="mb-1 text-xs font-medium text-slate-600">Equipamentos desta NF</p>
                  <ul className="space-y-1">
                    {inv.requests.map((r) => (
                      <li key={r.id} className="text-xs">
                        <Link
                          href={`/dashboard/engenharia/solicitacoes/${r.id}`}
                          className="text-emerald-700 hover:underline"
                        >
                          {r.equipmentName}
                        </Link>{" "}
                        <span className="text-slate-400">
                          · série {r.serialNumber || "—"}
                          {r.internalOs ? ` · ${r.internalOs}` : ""} · {r.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
