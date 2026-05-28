"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useState } from "react";

const items = [
  { key: "formFilled", label: "Formulário preenchido" },
  { key: "supplierIdentified", label: "Identificação fornecedor" },
  { key: "anvisa", label: "ANVISA" },
  { key: "preventiveMaintenance", label: "Manutenção preventiva" },
  { key: "calibration", label: "Calibração" },
  { key: "tse", label: "TSE" },
  { key: "manual", label: "Manual" },
  { key: "signedTerm", label: "Termo assinado" },
  { key: "accessories", label: "Acessórios" },
  { key: "sanitization", label: "Higienização" },
  { key: "insurance", label: "Seguro" },
] as const;

type Status = "APROVADO" | "PENDENTE" | "REPROVADO";

export function ChecklistPanel({
  requestId,
  checklist,
}: {
  requestId: string;
  checklist?: Record<string, Status | string | null>;
}) {
  const [statuses, setStatuses] = useState<Record<string, Status>>(
    Object.fromEntries(items.map((i) => [i.key, (checklist?.[i.key] as Status) ?? "PENDENTE"]))
  );
  const [rejectionReason, setRejectionReason] = useState((checklist?.rejectionReason as string) ?? "");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/checklist/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...statuses, rejectionReason }),
      });
      if (!res.ok) throw new Error("Erro ao salvar checklist");
      return res.json();
    },
    onSuccess: () => window.location.reload(),
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900">Checklist documental</h3>
      {items.map((item) => (
        <div key={item.key} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 p-3">
          <span className="text-sm text-slate-700">{item.label}</span>
          <div className="flex gap-1">
            {(["APROVADO", "PENDENTE", "REPROVADO"] as Status[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatuses((prev) => ({ ...prev, [item.key]: s }))}
                className={`rounded-lg px-2 py-1 text-xs font-medium ${
                  statuses[item.key] === s
                    ? s === "APROVADO"
                      ? "bg-emerald-100 text-emerald-800"
                      : s === "REPROVADO"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    : "bg-slate-50 text-slate-500"
                }`}
              >
                {s === "APROVADO" ? "✓" : s === "REPROVADO" ? "✗" : "…"}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div>
        <label className="text-sm font-medium text-slate-700">Motivo (obrigatório se reprovado)</label>
        <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="mt-1" />
      </div>
      <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        Salvar avaliação documental
      </Button>
    </div>
  );
}
