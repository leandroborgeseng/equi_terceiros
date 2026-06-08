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
            className="gesteq-pill gesteq-pill-amber"
          >
            <Receipt className="h-3.5 w-3.5" />
            NF {invoice.number}
          </button>
          {invoice.fileName && (
            <button
              type="button"
              onClick={openAttachment}
              className="inline-flex items-center gap-1 rounded-[var(--r-md)] border border-[var(--line)] px-2 py-2 text-xs text-[var(--brand-ink)] hover:bg-[var(--brand-soft)]"
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
            className="inline-flex items-center gap-1 rounded-[var(--r-md)] border border-[var(--line)] px-2 py-2 text-xs text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--bloqueado-ink)] disabled:opacity-60"
            title="Desvincular NF"
          >
            <Unlink className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="gesteq-pill gesteq-pill-amber"
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
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-0 sm:items-end sm:p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="max-h-[88vh] w-full max-w-lg overflow-hidden rounded-t-[var(--r-xl)] bg-[var(--surface)] shadow-[var(--shadow-lg)] sm:rounded-[var(--r-xl)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--line-2)] px-4 py-3.5">
                <div>
                  <h2 className="font-display font-semibold text-[var(--ink)]">
                    {invoice ? "Alterar nota fiscal" : "Vincular nota fiscal"}
                  </h2>
                  <p className="text-xs text-[var(--muted)]">
                    Selecione uma NF cadastrada com anexo
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-[var(--r-md)] p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(85vh - 8rem)" }}>
                {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

                {isLoading && <p className="text-sm text-[var(--muted)]">Carregando notas fiscais...</p>}

                {!isLoading && linkable.length === 0 && (
                  <div className="space-y-3 text-sm text-[var(--ink-2)]">
                    <p>
                      Nenhuma nota fiscal com anexo disponível.
                      {invoice ? " Você pode desvincular a NF atual ou cadastrar uma nova." : ""}
                    </p>
                    <Link
                      href="/notas-fiscais"
                      className="inline-flex items-center gap-1 text-[var(--brand-ink)] hover:underline"
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
                        className="w-full rounded-[var(--r-lg)] border border-[var(--line)] p-3 text-left transition-colors hover:border-[color-mix(in_oklch,var(--brand)_40%,transparent)] hover:bg-[var(--brand-soft)]/50 disabled:opacity-60"
                      >
                        <p className="font-medium text-[var(--ink)]">NF {inv.number}</p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {inv.supplierName ?? "—"}
                          {inv.issueDate ? ` · ${formatDate(inv.issueDate)}` : ""}
                          {inv.fileName ? ` · ${inv.fileName}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {inv.requests.length} equipamento(s) já vinculado(s)
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-[var(--line-2)] px-4 py-3">
                <Link
                  href="/notas-fiscais"
                  className="text-xs text-[var(--brand-ink)] hover:underline"
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
