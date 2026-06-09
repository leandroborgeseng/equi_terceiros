"use client";

import { useEffect, useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { INSPECTION_ITEMS } from "@/lib/validators/request";
import { ChecklistItem } from "./checklist-item";
import { SignaturePad } from "./signature-pad";
import { INSP_OPTIONS, TRI_OPTIONS } from "@/lib/checklist-options";
import { StatusSeg } from "@/components/gesteq/status-seg";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type ItemStatus = "CONFORME" | "NAO_CONFORME" | "NA";

type InspectionData = {
  status?: string;
  item1Status?: string;
  item2Status?: string;
  item3Status?: string;
  item4Status?: string;
  item5Status?: string;
  item6Status?: string;
  item7Status?: string;
  electricalSafetyTest?: string;
  electricalSafetyResult?: string | null;
  cmeRequired?: boolean;
  generalNotes?: string | null;
  restrictionNotes?: string | null;
  blockReason?: string | null;
  signatureData?: string | null;
  inspectedAt?: string | null;
  inspector?: { name: string } | null;
};

const OPTIONS = INSP_OPTIONS;
const SAFETY_OPTIONS = TRI_OPTIONS;

function parseApiError(data: unknown): string {
  if (!data || typeof data !== "object") return "Erro ao salvar inspeção";
  const err = data as { error?: unknown };
  if (typeof err.error === "string") return err.error;
  if (err.error && typeof err.error === "object") {
    const flat = err.error as { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
    const msgs = [
      ...(flat.formErrors ?? []),
      ...Object.values(flat.fieldErrors ?? {}).flat(),
    ];
    if (msgs.length) return msgs.join(" · ");
  }
  return "Erro ao salvar inspeção";
}

export function InspectionPanel({
  requestId,
  inspection,
  termAccepted = false,
}: {
  requestId: string;
  inspection?: InspectionData | null;
  termAccepted?: boolean;
}) {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>(inspection?.status ?? "PENDENTE");
  const [items, setItems] = useState<Record<string, ItemStatus>>(() =>
    Object.fromEntries(
      INSPECTION_ITEMS.map((i) => [
        i.key,
        (inspection?.[`${i.key}Status` as keyof InspectionData] as ItemStatus) ?? "NA",
      ])
    )
  );
  const [electricalSafetyTest, setElectricalSafetyTest] = useState(
    inspection?.electricalSafetyTest ?? "NA"
  );
  const [electricalSafetyResult, setElectricalSafetyResult] = useState(
    inspection?.electricalSafetyResult ?? ""
  );
  const [cmeRequired, setCmeRequired] = useState(inspection?.cmeRequired ?? false);
  const [generalNotes, setGeneralNotes] = useState(inspection?.generalNotes ?? "");
  const [restrictionNotes, setRestrictionNotes] = useState(inspection?.restrictionNotes ?? "");
  const [blockReason, setBlockReason] = useState(inspection?.blockReason ?? "");
  const signatureRef = useRef<string>(inspection?.signatureData ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!inspection) return;
    setStatus(inspection.status ?? "PENDENTE");
    setItems(
      Object.fromEntries(
        INSPECTION_ITEMS.map((i) => [
          i.key,
          (inspection[`${i.key}Status` as keyof InspectionData] as ItemStatus) ?? "NA",
        ])
      )
    );
    setElectricalSafetyTest(inspection.electricalSafetyTest ?? "NA");
    setElectricalSafetyResult(inspection.electricalSafetyResult ?? "");
    setCmeRequired(inspection.cmeRequired ?? false);
    setGeneralNotes(inspection.generalNotes ?? "");
    setRestrictionNotes(inspection.restrictionNotes ?? "");
    setBlockReason(inspection.blockReason ?? "");
    signatureRef.current = inspection.signatureData ?? "";
  }, [inspection]);

  function validate(): string | null {
    if (status === "LIBERADO_COM_RESTRICAO" && !restrictionNotes.trim()) {
      return "Informe a restrição de uso antes de liberar com restrição.";
    }
    if (status === "BLOQUEADO" && !blockReason.trim()) {
      return "Informe o motivo do bloqueio/interdição.";
    }
    if (status.startsWith("LIBERADO") && !termAccepted) {
      return "O Termo de Responsabilidade (Anexo IV) deve ser aceito na aba Termo antes da liberação.";
    }
    return null;
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const validationError = validate();
      if (validationError) throw new Error(validationError);

      const payload: Record<string, unknown> = {
        status,
        electricalSafetyTest,
        electricalSafetyResult,
        cmeRequired,
        generalNotes,
        restrictionNotes: status === "LIBERADO_COM_RESTRICAO" ? restrictionNotes : undefined,
        blockReason: status === "BLOQUEADO" ? blockReason : undefined,
        signatureData: signatureRef.current || undefined,
      };
      for (const i of INSPECTION_ITEMS) payload[`${i.key}Status`] = items[i.key];

      const res = await fetch(`/api/inspections/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(parseApiError(data));
      return data;
    },
    onSuccess: () => {
      setError(null);
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["request", requestId] });
      setTimeout(() => setSaved(false), 4000);
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="space-y-4">
      <h3 className="font-display font-semibold text-[var(--ink)]">Inspeção técnica (Anexo III)</h3>

      {inspection?.inspectedAt && (
        <p className="text-xs text-[var(--muted)]">
          Última inspeção: {new Date(inspection.inspectedAt).toLocaleString("pt-BR")}
          {inspection.inspector?.name ? ` · ${inspection.inspector.name}` : ""}
        </p>
      )}

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
                className={
                  electricalSafetyTest === o.value
                    ? "on !bg-[var(--brand-soft)] !text-[var(--brand-ink)] text-xs"
                    : "text-xs"
                }
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
        <p className="gesteq-eyebrow mb-3">Status final de liberação</p>
        <StatusSeg
          variant="verdict"
          value={status}
          onChange={(v) => {
            setStatus(v);
            setError(null);
          }}
          options={[
            { value: "PENDENTE", label: "Pendente", tone: "pendente", desc: "Aguardando parecer" },
            { value: "LIBERADO", label: "Liberado", tone: "liberado", desc: "Apto para uso" },
            {
              value: "LIBERADO_COM_RESTRICAO",
              label: "C/ restrição",
              tone: "restricao",
              desc: "Apto com ressalvas",
            },
            { value: "BLOQUEADO", label: "Bloqueado", tone: "danger", desc: "Uso impedido" },
          ]}
        />
      </div>

      {status.startsWith("LIBERADO") && !termAccepted && (
        <div className="flex items-start gap-2 rounded-[var(--r-lg)] border border-[color-mix(in_oklch,var(--pendente)_35%,transparent)] bg-[var(--pendente-soft)] px-3 py-2.5 text-sm text-[var(--pendente-ink)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Aceite o <strong>Termo de Responsabilidade (Anexo IV)</strong> na aba Termo antes de
            registrar a liberação.
          </p>
        </div>
      )}

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

      {error && (
        <div className="flex items-start gap-2 rounded-[var(--r-lg)] bg-[var(--bloqueado-soft)] px-3 py-2.5 text-sm text-[var(--bloqueado-ink)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 text-sm text-[var(--liberado-ink)]">
          <CheckCircle2 className="h-4 w-4" />
          Inspeção registrada com sucesso.
        </div>
      )}

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
