"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { SignaturePad } from "./signature-pad";
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type Term = {
  accepted?: boolean;
  signerName?: string | null;
  signedAt?: string | null;
  ecReviewed?: boolean;
} | null;

export function TermPanel({
  requestId,
  term,
  ownerName,
}: {
  requestId: string;
  term: Term;
  ownerName?: string;
}) {
  const qc = useQueryClient();
  const [signerName, setSignerName] = useState(term?.signerName ?? ownerName ?? "");
  const [signature, setSignature] = useState("");
  const [ecReviewed, setEcReviewed] = useState(term?.ecReviewed ?? false);
  const [error, setError] = useState<string | null>(null);

  const accepted = !!term?.accepted;

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/terms/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accepted: true,
          signerName,
          signatureData: signature || undefined,
          ecReviewed,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao registrar termo");
      return data;
    },
    onSuccess: () => {
      setError(null);
      qc.invalidateQueries({ queryKey: ["request", requestId] });
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display flex items-center gap-2 font-semibold text-[var(--ink)]">
          <FileText className="h-5 w-5 text-[var(--brand-ink)]" /> Termo de Responsabilidade (Anexo IV)
        </h3>
        <a
          href={`/api/terms/${requestId}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-[var(--brand-ink)] hover:underline"
        >
          Baixar PDF
        </a>
      </div>

      {accepted ? (
        <div className="flex items-start gap-2 rounded-[var(--r-lg)] border border-[var(--brand-line)] bg-[var(--brand-soft)] px-4 py-3 text-sm text-[var(--brand-ink)]">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Termo aceito/assinado.</p>
            <p className="text-xs">
              Por {term?.signerName ?? "—"}
              {term?.signedAt ? ` em ${formatDateTime(term.signedAt)}` : ""}
              {term?.ecReviewed ? " · com visto da Engenharia Clínica" : ""}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-[var(--r-lg)] border border-[color-mix(in_oklch,var(--pendente)_35%,transparent)] bg-[var(--pendente-soft)] px-4 py-3 text-sm text-[var(--pendente-ink)]">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Pré-requisito para liberação. Registre o aceite eletrônico do responsável (empresa PJ,
            médico ou representante) antes de liberar o equipamento.
          </p>
        </div>
      )}

      <div className="space-y-3 rounded-[var(--r-lg)] border border-[var(--line)] p-3">
        <div>
          <Label>Responsável que aceita (nome) *</Label>
          <Input value={signerName} onChange={(e) => setSignerName(e.target.value)} />
        </div>
        <div>
          <Label>Assinatura (opcional)</Label>
          <SignaturePad onChange={setSignature} />
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--ink-2)]">
          <input
            type="checkbox"
            checked={ecReviewed}
            onChange={(e) => setEcReviewed(e.target.checked)}
            className="rounded"
          />
          Visto da Engenharia Clínica
        </label>

        {error && <p className="text-sm text-[var(--bloqueado-ink)]">{error}</p>}

        <Button
          onClick={() => {
            if (!signerName.trim()) {
              setError("Informe o nome de quem aceita o termo");
              return;
            }
            mutation.mutate();
          }}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Salvando..." : accepted ? "Atualizar aceite" : "Registrar aceite do termo"}
        </Button>
      </div>
    </div>
  );
}
