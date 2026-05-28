"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

const checks = [
  { key: "physicalIntegrity", label: "Integridade física" },
  { key: "cabinet", label: "Gabinete" },
  { key: "cables", label: "Cabos" },
  { key: "abntPlug", label: "Plugue ABNT" },
  { key: "cleaning", label: "Limpeza" },
  { key: "accessories", label: "Acessórios" },
  { key: "selfDiagnostic", label: "Autodiagnóstico" },
  { key: "alarms", label: "Alarmes" },
  { key: "electricalCompatibility", label: "Compatibilidade elétrica" },
  { key: "gasCompatibility", label: "Compatibilidade gases" },
  { key: "infrastructureCompat", label: "Compatibilidade infraestrutura" },
  { key: "metrologicalEval", label: "Avaliação metrológica" },
  { key: "needsCalibration", label: "Necessita calibração" },
  { key: "needsTse", label: "Necessita TSE" },
] as const;

export function InspectionPanel({ requestId }: { requestId: string }) {
  const [status, setStatus] = useState<string>("PENDENTE");
  const [values, setValues] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [restrictionNotes, setRestrictionNotes] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/inspections/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...values,
          notes,
          restrictionNotes,
          blockReason,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar inspeção");
      return res.json();
    },
    onSuccess: () => window.location.reload(),
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900">Inspeção técnica</h3>
      <div className="flex flex-wrap gap-2">
        {["PENDENTE", "LIBERADO", "LIBERADO_COM_RESTRICAO", "BLOQUEADO"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-xl px-3 py-2 text-xs font-medium ${
              status === s
                ? s === "LIBERADO"
                  ? "bg-emerald-600 text-white"
                  : s === "BLOQUEADO"
                    ? "bg-red-600 text-white"
                    : s === "LIBERADO_COM_RESTRICAO"
                      ? "bg-orange-500 text-white"
                      : "bg-amber-500 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {checks.map((c) => (
          <label key={c.key} className="flex items-center gap-2 rounded-lg border border-slate-100 p-2 text-sm">
            <input
              type="checkbox"
              checked={values[c.key] ?? false}
              onChange={(e) => setValues((v) => ({ ...v, [c.key]: e.target.checked }))}
            />
            {c.label}
          </label>
        ))}
      </div>
      <Textarea placeholder="Observações" value={notes} onChange={(e) => setNotes(e.target.value)} />
      {status === "LIBERADO_COM_RESTRICAO" && (
        <Textarea placeholder="Restrições" value={restrictionNotes} onChange={(e) => setRestrictionNotes(e.target.value)} />
      )}
      {status === "BLOQUEADO" && (
        <Textarea placeholder="Motivo do bloqueio *" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} />
      )}
      <div className="flex gap-2">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          Registrar inspeção
        </Button>
        <a href={`/api/labels/${requestId}`} target="_blank" rel="noreferrer">
          <Button variant="outline" type="button">Gerar etiqueta PDF</Button>
        </a>
      </div>
    </div>
  );
}
