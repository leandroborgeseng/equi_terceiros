"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { INSPECTION_ITEMS } from "@/lib/validators/request";
import { ChecklistItem } from "./checklist-item";
import { SignaturePad } from "./signature-pad";

type ItemStatus = "CONFORME" | "NAO_CONFORME" | "NA";

const OPTIONS = [
  { value: "CONFORME", label: "Conforme", activeClass: "bg-emerald-100 text-emerald-800" },
  { value: "NAO_CONFORME", label: "Não conf.", activeClass: "bg-red-100 text-red-800" },
  { value: "NA", label: "N/A", activeClass: "bg-slate-200 text-slate-700" },
];

const SAFETY_OPTIONS = [
  { value: "SIM", label: "Sim", activeClass: "bg-emerald-100 text-emerald-800" },
  { value: "NAO", label: "Não", activeClass: "bg-red-100 text-red-800" },
  { value: "NA", label: "N/A", activeClass: "bg-slate-200 text-slate-700" },
];

export function InspectionPanel({ requestId }: { requestId: string }) {
  const [status, setStatus] = useState<string>("PENDENTE");
  const [items, setItems] = useState<Record<string, ItemStatus>>(
    Object.fromEntries(INSPECTION_ITEMS.map((i) => [i.key, "NA"]))
  );
  const [electricalSafetyTest, setElectricalSafetyTest] = useState("NA");
  const [electricalSafetyResult, setElectricalSafetyResult] = useState("");
  const [cmeRequired, setCmeRequired] = useState(false);
  const [generalNotes, setGeneralNotes] = useState("");
  const [restrictionNotes, setRestrictionNotes] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const signatureRef = useRef<string>("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        status,
        electricalSafetyTest,
        electricalSafetyResult,
        cmeRequired,
        generalNotes,
        restrictionNotes,
        blockReason,
        signatureData: signatureRef.current,
      };
      for (const i of INSPECTION_ITEMS) payload[`${i.key}Status`] = items[i.key];

      const res = await fetch(`/api/inspections/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.toString?.() ?? "Erro ao salvar inspeção");
      return data;
    },
    onSuccess: () => window.location.reload(),
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900">Inspeção técnica (Anexo III)</h3>

      {INSPECTION_ITEMS.map((item, idx) => (
        <ChecklistItem
          key={item.key}
          index={idx + 1}
          label={item.label}
          value={items[item.key]}
          options={OPTIONS}
          onChange={(v) => setItems((p) => ({ ...p, [item.key]: v as ItemStatus }))}
        />
      ))}

      <div className="rounded-xl border border-slate-200 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-slate-700">Teste de segurança elétrica realizado?</span>
          <div className="flex gap-1">
            {SAFETY_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setElectricalSafetyTest(o.value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                  electricalSafetyTest === o.value ? o.activeClass : "bg-slate-50 text-slate-500"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        {electricalSafetyTest === "SIM" && (
          <input
            type="text"
            value={electricalSafetyResult}
            onChange={(e) => setElectricalSafetyResult(e.target.value)}
            placeholder="Resultado / nº do laudo"
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
          />
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={cmeRequired} onChange={(e) => setCmeRequired(e.target.checked)} />
        Necessita encaminhamento ao CME
      </label>

      <Textarea
        placeholder="Observações gerais"
        value={generalNotes}
        onChange={(e) => setGeneralNotes(e.target.value)}
      />

      <div className="rounded-xl bg-slate-50 p-3">
        <p className="mb-2 text-sm font-medium text-slate-700">Status final de liberação</p>
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
                  : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {status === "LIBERADO_COM_RESTRICAO" && (
        <Textarea
          placeholder="Especifique a restrição *"
          value={restrictionNotes}
          onChange={(e) => setRestrictionNotes(e.target.value)}
        />
      )}
      {status === "BLOQUEADO" && (
        <Textarea
          placeholder="Motivo do bloqueio/interdição *"
          value={blockReason}
          onChange={(e) => setBlockReason(e.target.value)}
        />
      )}

      <div>
        <p className="mb-1 text-sm font-medium text-slate-700">Assinatura do responsável técnico</p>
        <SignaturePad onChange={(data) => (signatureRef.current = data)} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? "Salvando..." : "Registrar inspeção"}
        </Button>
        <a href={`/api/labels/${requestId}`} target="_blank" rel="noreferrer">
          <Button variant="outline" type="button">
            Gerar etiqueta PDF
          </Button>
        </a>
      </div>
    </div>
  );
}
