"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Receipt, Link2, X, ExternalLink, Unlink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type InvoiceSummary = {
  id: string;
  number: string;
  issueDate?: string | null;
  supplierName?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  requests: { id: string }[];
};

type CurrentInvoice = {
  id: string;
  number: string;
  fileName?: string | null;
  fileKey?: string | null;
};

export function InvoiceLinkButton({
  requestId,
  invoice,
}: {
  requestId: string;
  invoice?: CurrentInvoice | null;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: invoices = [], isLoading } = useQuery<InvoiceSummary[]>({
    queryKey: ["invoices"],
    queryFn: () => fetch("/api/invoices").then((r) => r.json()),
    enabled: open,
  });

  const linkable = invoices.filter((inv) => inv.fileKey && inv.id !== invoice?.id);

  const linkMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkRequestIds: [requestId] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao vincular nota fiscal");
      return data;
    },
    onSuccess: (data) => {
      setOpen(false);
      setError(null);
      qc.invalidateQueries({ queryKey: ["request", requestId] });
      qc.invalidateQueries({ queryKey: ["invoice-file", data.id] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["equipamentos"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const unlinkMutation = useMutation({
    mutationFn: async () => {
      if (!invoice?.id) return;
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlinkRequestIds: [requestId] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao desvincular nota fiscal");
      return data;
    },
    onSuccess: () => {
      setError(null);
      qc.invalidateQueries({ queryKey: ["request", requestId] });
      if (invoice?.id) qc.invalidateQueries({ queryKey: ["invoice-file", invoice.id] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["equipamentos"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  async function openAttachment() {
    if (!invoice?.id) return;
    const res = await fetch(`/api/invoices/${invoice.id}/file`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Não foi possível abrir o anexo");
      return;
    }
    window.open(data.url, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      {invoice ? (
        <div className="inline-flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-100"
          >
            <Receipt className="h-3.5 w-3.5" />
            NF {invoice.number}
          </button>
          {invoice.fileName && (
            <button
              type="button"
              onClick={openAttachment}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-2 text-xs text-emerald-700 hover:bg-emerald-50"
              title="Abrir anexo da NF"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (confirm("Desvincular esta nota fiscal do equipamento?")) {
                unlinkMutation.mutate();
              }
            }}
            disabled={unlinkMutation.isPending}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-500 hover:bg-slate-50 hover:text-red-600 disabled:opacity-60"
            title="Desvincular NF"
          >
            <Unlink className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-100"
        >
          <Link2 className="h-3.5 w-3.5" />
          Vincular NF
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {invoice ? "Alterar nota fiscal" : "Vincular nota fiscal"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Selecione uma NF cadastrada com anexo
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(85vh - 8rem)" }}>
                {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

                {isLoading && <p className="text-sm text-slate-500">Carregando notas fiscais...</p>}

                {!isLoading && linkable.length === 0 && (
                  <div className="space-y-3 text-sm text-slate-600">
                    <p>
                      Nenhuma nota fiscal com anexo disponível.
                      {invoice ? " Você pode desvincular a NF atual ou cadastrar uma nova." : ""}
                    </p>
                    <Link
                      href="/notas-fiscais"
                      className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                      onClick={() => setOpen(false)}
                    >
                      <Receipt className="h-4 w-4" />
                      Ir para Notas Fiscais
                    </Link>
                  </div>
                )}

                <ul className="space-y-2">
                  {linkable.map((inv) => (
                    <li key={inv.id}>
                      <button
                        type="button"
                        onClick={() => linkMutation.mutate(inv.id)}
                        disabled={linkMutation.isPending}
                        className="w-full rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/50 disabled:opacity-60"
                      >
                        <p className="font-medium text-slate-900">NF {inv.number}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {inv.supplierName ?? "—"}
                          {inv.issueDate ? ` · ${formatDate(inv.issueDate)}` : ""}
                          {inv.fileName ? ` · ${inv.fileName}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {inv.requests.length} equipamento(s) já vinculado(s)
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
                <Link
                  href="/notas-fiscais"
                  className="text-xs text-emerald-700 hover:underline"
                  onClick={() => setOpen(false)}
                >
                  Cadastrar nova NF
                </Link>
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
