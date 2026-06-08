"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { INSPECTION_ITEMS } from "@/lib/validators/request";
import { ChecklistItem } from "./checklist-item";
import { SignaturePad } from "./signature-pad";
import { INSP_OPTIONS, TRI_OPTIONS } from "@/lib/checklist-options";
import { StatusSeg } from "@/components/gesteq/status-seg";

type ItemStatus = "CONFORME" | "NAO_CONFORME" | "NA";

const OPTIONS = INSP_OPTIONS;
const SAFETY_OPTIONS = TRI_OPTIONS;

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
      <h3 className="font-display font-semibold text-[var(--ink)]">Inspeção técnica (Anexo III)</h3>

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

      <div className="rounded-[var(--r-lg)] border border-[var(--line)] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-[var(--ink-2)]">Teste de segurança elétrica realizado?</span>
          <div className="gesteq-seg">
            {SAFETY_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setElectricalSafetyTest(o.value)}
                className={electricalSafetyTest === o.value ? "on text-xs" : "text-xs"}
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
            className="mt-2 w-full rounded-[var(--r)] border border-[var(--line)] px-3 py-1.5 text-sm focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--ink-2)]">
        <input type="checkbox" checked={cmeRequired} onChange={(e) => setCmeRequired(e.target.checked)} />
        Necessita encaminhamento ao CME
      </label>

      <Textarea
        placeholder="Observações gerais"
        value={generalNotes}
        onChange={(e) => setGeneralNotes(e.target.value)}
      />

      <div className="rounded-[var(--r-lg)] border border-[var(--line-2)] bg-[var(--surface-2)] p-3">
        <p className="gesteq-eyebrow mb-2">Status final de liberação</p>
        <StatusSeg
          value={status}
          onChange={setStatus}
          options={[
            { value: "PENDENTE", label: "Pendente", tone: "pendente" },
            { value: "LIBERADO", label: "Liberado", tone: "liberado" },
            { value: "LIBERADO_COM_RESTRICAO", label: "C/ restrição", tone: "restricao" },
            { value: "BLOQUEADO", label: "Bloqueado", tone: "danger" },
          ]}
        />
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
        <p className="gesteq-eyebrow mb-1">Assinatura do responsável técnico</p>
        <SignaturePad onChange={(data) => (signatureRef.current = data)} />
      </div>

      {error && <p className="text-sm text-[var(--bloqueado-ink)]">{error}</p>}

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
