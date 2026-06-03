"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useState } from "react";
import { DOC_CHECKLIST_ITEMS } from "@/lib/validators/request";
import { ChecklistItem } from "./checklist-item";

type DocItem = "SIM" | "NAO" | "NA";
type DocStatus = "APROVADO" | "PENDENTE" | "REPROVADO";

const OPTIONS = [
  { value: "SIM", label: "Sim", activeClass: "bg-emerald-100 text-emerald-800" },
  { value: "NAO", label: "Não", activeClass: "bg-red-100 text-red-800" },
  { value: "NA", label: "N/A", activeClass: "bg-slate-200 text-slate-700" },
];

export function ChecklistPanel({
  requestId,
  checklist,
}: {
  requestId: string;
  checklist?: Record<string, string | null> | null;
}) {
  const [statuses, setStatuses] = useState<Record<string, DocItem>>(
    Object.fromEntries(
      DOC_CHECKLIST_ITEMS.map((i) => [
        i.key,
        (checklist?.[`${i.key}Status`] as DocItem) ?? "NA",
      ])
    )
  );
  const [obs, setObs] = useState<Record<string, string>>(
    Object.fromEntries(
      DOC_CHECKLIST_ITEMS.map((i) => [i.key, (checklist?.[`${i.key}Obs`] as string) ?? ""])
    )
  );
  const [docStatus, setDocStatus] = useState<DocStatus>(
    (checklist?.docStatus as DocStatus) ?? "PENDENTE"
  );
  const [rejectionReason, setRejectionReason] = useState(
    (checklist?.rejectionReason as string) ?? ""
  );
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = { docStatus, rejectionReason };
      for (const i of DOC_CHECKLIST_ITEMS) {
        payload[`${i.key}Status`] = statuses[i.key];
        payload[`${i.key}Obs`] = obs[i.key];
      }
      const res = await fetch(`/api/checklist/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.toString?.() ?? "Erro ao salvar checklist");
      return data;
    },
    onSuccess: () => window.location.reload(),
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900">Checklist documental (Anexo II)</h3>
      {DOC_CHECKLIST_ITEMS.map((item, idx) => (
        <ChecklistItem
          key={item.key}
          index={idx + 1}
          label={item.label}
          value={statuses[item.key]}
          options={OPTIONS}
          onChange={(v) => setStatuses((p) => ({ ...p, [item.key]: v as DocItem }))}
          obs={obs[item.key]}
          onObsChange={(v) => setObs((p) => ({ ...p, [item.key]: v }))}
        />
      ))}

      <div className="rounded-xl bg-slate-50 p-3">
        <p className="mb-2 text-sm font-medium text-slate-700">Parecer final</p>
        <div className="flex gap-2">
          {(["APROVADO", "PENDENTE", "REPROVADO"] as DocStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setDocStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                docStatus === s
                  ? s === "APROVADO"
                    ? "bg-emerald-600 text-white"
                    : s === "REPROVADO"
                      ? "bg-red-600 text-white"
                      : "bg-amber-500 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {(docStatus === "REPROVADO" || docStatus === "PENDENTE") && (
        <div>
          <label className="text-sm font-medium text-slate-700">
            Motivo / pendência {docStatus === "REPROVADO" && "(obrigatório)"}
          </label>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="mt-1"
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        {mutation.isPending ? "Salvando..." : "Finalizar checklist"}
      </Button>
    </div>
  );
}
