"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  medicalRequestSchema,
  wizardStepSchemas,
} from "@/lib/validators/request";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";

type FormData = z.input<typeof medicalRequestSchema>;

const steps = [
  { title: "Contexto clínico", index: 0 },
  { title: "Procedimento", index: 1 },
  { title: "Justificativa", index: 2 },
  { title: "Equipamento", index: 3 },
  { title: "Fornecedor", index: 4 },
] as const;

function flattenErrors(errors: Record<string, unknown>): string[] {
  const messages: string[] = [];
  for (const val of Object.values(errors)) {
    if (val && typeof val === "object" && "message" in val && val.message) {
      messages.push(String(val.message));
    }
  }
  return messages;
}

export function MedicalRequestWizard() {
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [autoSaved, setAutoSaved] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(medicalRequestSchema),
    defaultValues: {
      requestDate: new Date().toISOString().slice(0, 10),
      plannedDate: new Date().toISOString().slice(0, 10),
      noInstitutionalAlternative: true,
      isUrgent: false,
      plannedTime: "08:00",
    },
    mode: "onTouched",
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: { data: FormData; nextStep: number }) => {
      const body = {
        ...payload.data,
        wizardStep: payload.nextStep,
        status: "RASCUNHO",
      };

      const url = requestId ? `/api/requests/${requestId}` : "/api/requests";
      const method = requestId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof json.error === "string"
            ? json.error
            : json.error?.fieldErrors
              ? Object.values(json.error.fieldErrors).flat().join(", ")
              : "Erro ao salvar rascunho";
        throw new Error(msg);
      }
      return json;
    },
    onSuccess: (data) => {
      if (!requestId && data?.id) setRequestId(data.id);
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      setSaveError(null);
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 2000);
    },
    onError: (err: Error) => setSaveError(err.message),
  });

  const autoSave = useCallback(
    (data: FormData) => {
      if (!requestId && step === 0) return;
      saveMutation.mutate({ data, nextStep: step + 1 });
    },
    [requestId, step, saveMutation]
  );

  useEffect(() => {
    if (!requestId) return;
    let timer: ReturnType<typeof setTimeout>;
    const sub = form.watch(() => {
      clearTimeout(timer);
      timer = setTimeout(() => autoSave(form.getValues()), 1500);
    });
    return () => {
      clearTimeout(timer);
      sub.unsubscribe();
    };
  }, [form, requestId, autoSave]);

  useEffect(() => {
    if (session?.user?.email && !form.getValues("doctorCrm")) {
      const u = session.user as { crm?: string };
      if (u.crm) form.setValue("doctorCrm", u.crm);
    }
  }, [session, form]);

  async function validateCurrentStep() {
    const schema = wizardStepSchemas[step];
    const values = form.getValues();
    const result = schema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormData;
        form.setError(field, { message: issue.message });
      }
      return false;
    }
    return true;
  }

  async function nextStep() {
    setSaveError(null);
    const valid = await validateCurrentStep();
    if (!valid) return;

    try {
      const saved = await saveMutation.mutateAsync({
        data: form.getValues(),
        nextStep: step + 2,
      });
      if (!requestId && saved?.id) setRequestId(saved.id);
      setStep((s) => Math.min(s + 1, steps.length - 1));
    } catch {
      /* erro em saveError */
    }
  }

  async function finishWizard() {
    setSaveError(null);
    const valid = await validateCurrentStep();
    if (!valid) return;

    const full = medicalRequestSchema.safeParse(form.getValues());
    if (!full.success) {
      for (const issue of full.error.issues) {
        const field = issue.path[0] as keyof FormData;
        form.setError(field, { message: issue.message });
      }
      setSaveError("Revise os campos destacados antes de continuar.");
      return;
    }

    try {
      const saved = await saveMutation.mutateAsync({
        data: form.getValues(),
        nextStep: steps.length,
      });
      const id = requestId ?? saved?.id;
      if (id) {
        window.location.href = `/dashboard/medico/solicitacoes/${id}/documentos`;
      }
    } catch {
      /* saveError */
    }
  }

  const fieldErrors = flattenErrors(form.formState.errors);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Nova solicitação médica</CardTitle>
          <div className="text-right text-sm text-slate-500">
            <p>Etapa {step + 1} de {steps.length}</p>
            {autoSaved && <p className="text-emerald-600">Rascunho salvo</p>}
          </div>
        </div>
        {session?.user?.name && (
          <p className="mt-2 text-sm text-slate-600">
            Médico solicitante: <strong>{session.user.name}</strong>
          </p>
        )}
        <div className="mt-4 flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-emerald-500" : "bg-slate-200"}`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="space-y-4"
            >
              <h3 className="font-medium text-slate-800">{steps[step].title}</h3>

              {step === 0 && (
                <>
                  <div>
                    <Label>Data da solicitação</Label>
                    <Input type="date" {...form.register("requestDate")} />
                  </div>
                  <div>
                    <Label>Setor de uso</Label>
                    <Input
                      {...form.register("usageSector")}
                      placeholder="Centro Cirúrgico — Sala 03"
                    />
                  </div>
                  <div>
                    <Label>CRM</Label>
                    <Input {...form.register("doctorCrm")} placeholder="123456-SP" />
                  </div>
                  <div>
                    <Label>Paciente</Label>
                    <Input {...form.register("patientName")} placeholder="Nome do paciente" />
                  </div>
                  <div>
                    <Label>Prontuário</Label>
                    <Input {...form.register("medicalRecord")} placeholder="Nº prontuário" />
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <div>
                    <Label>Procedimento previsto</Label>
                    <Input {...form.register("plannedProcedure")} />
                  </div>
                  <div>
                    <Label>Data prevista</Label>
                    <Input type="date" {...form.register("plannedDate")} />
                  </div>
                  <div>
                    <Label>Horário previsto</Label>
                    <Input type="time" {...form.register("plannedTime")} />
                  </div>
                  <div>
                    <Label>Justificativa clínica</Label>
                    <Textarea {...form.register("clinicalJustification")} rows={4} />
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.watch("noInstitutionalAlternative")}
                      onChange={(e) =>
                        form.setValue("noInstitutionalAlternative", e.target.checked)
                      }
                      className="rounded"
                    />
                    Ausência de alternativa institucional
                  </label>
                  <div>
                    <Label>Ganho técnico-assistencial</Label>
                    <Textarea {...form.register("technicalBenefit")} />
                  </div>
                  <div>
                    <Label>Risco assistencial</Label>
                    <Input
                      {...form.register("assistentialRisk")}
                      placeholder="Baixo / Médio / Alto"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!form.watch("isUrgent")}
                      onChange={(e) => form.setValue("isUrgent", e.target.checked)}
                      className="rounded"
                    />
                    Urgência / Emergência
                  </label>
                </>
              )}
              {step === 3 && (
                <>
                  <div>
                    <Label>Equipamento</Label>
                    <Input {...form.register("equipmentName")} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Marca</Label>
                      <Input {...form.register("brand")} />
                    </div>
                    <div>
                      <Label>Modelo</Label>
                      <Input {...form.register("model")} />
                    </div>
                  </div>
                  <div>
                    <Label>Número de série (se disponível)</Label>
                    <Input {...form.register("serialNumber")} />
                  </div>
                  <div>
                    <Label>Tipo de ingresso</Label>
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      {...form.register("entryType")}
                    >
                      <option value="MEDICO">Médico</option>
                      <option value="FORNECEDOR">Fornecedor</option>
                      <option value="COMODATO">Comodato</option>
                      <option value="ALUGUEL">Aluguel</option>
                      <option value="DEMONSTRACAO">Demonstração</option>
                      <option value="OUTRO">Outro</option>
                    </select>
                  </div>
                  <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    Classe sugerida:{" "}
                    <strong className="text-slate-700">
                      {form.watch("isUrgent")
                        ? "D — Urgência/Emergência"
                        : "B — Temporário programado (ajustável pela Engenharia Clínica)"}
                    </strong>
                  </p>
                </>
              )}
              {step === 4 && (
                <>
                  <div>
                    <Label>Fornecedor</Label>
                    <Input {...form.register("supplierName")} />
                  </div>
                  <div>
                    <Label>Proprietário</Label>
                    <Input {...form.register("ownerName")} />
                  </div>
                  <div>
                    <Label>Contatos</Label>
                    <Input {...form.register("ownerContact")} />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {(fieldErrors.length > 0 || saveError) && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError && <p>{saveError}</p>}
              {fieldErrors.map((m) => (
                <p key={m}>{m}</p>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0 || saveMutation.isPending}
              onClick={() => setStep((s) => s - 1)}
            >
              <ChevronLeft className="h-4 w-4" /> Voltar
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={saveMutation.isPending}
              onClick={async () => {
                setSaveError(null);
                try {
                  await saveMutation.mutateAsync({
                    data: form.getValues(),
                    nextStep: step + 1,
                  });
                } catch {
                  /* saveError */
                }
              }}
            >
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? "Salvando..." : "Salvar rascunho"}
            </Button>
            {step < steps.length - 1 ? (
              <Button
                type="button"
                className="ml-auto"
                disabled={saveMutation.isPending}
                onClick={nextStep}
              >
                {saveMutation.isPending ? "Salvando..." : "Próximo"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                className="ml-auto"
                disabled={saveMutation.isPending}
                onClick={finishWizard}
              >
                Ir para documentação
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
