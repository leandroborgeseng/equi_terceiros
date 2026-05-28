"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { medicalRequestSchema } from "@/lib/validators/request";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";

type FormData = z.input<typeof medicalRequestSchema>;

const steps = [
  { title: "Contexto clínico", fields: ["requestDate", "usageSector", "doctorCrm", "patientName", "medicalRecord"] as const },
  { title: "Procedimento", fields: ["plannedProcedure", "plannedDate", "plannedTime", "clinicalJustification"] as const },
  { title: "Justificativa", fields: ["noInstitutionalAlternative", "technicalBenefit", "assistentialRisk", "isUrgent"] as const },
  { title: "Equipamento", fields: ["equipmentName", "brand", "model", "serialNumber"] as const },
  { title: "Fornecedor", fields: ["supplierName", "ownerName", "ownerContact"] as const },
];

export function MedicalRequestWizard() {
  const [step, setStep] = useState(0);
  const [requestId, setRequestId] = useState<string | null>(null);
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
    mode: "onChange",
  });

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const parsed = medicalRequestSchema.parse(data);
      const url = requestId ? `/api/requests/${requestId}` : "/api/requests";
      const method = requestId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed, wizardStep: step + 1, status: "RASCUNHO" }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      return res.json();
    },
    onSuccess: (data) => {
      if (!requestId) setRequestId(data.id);
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });

  const nextStep = async () => {
    const fields = steps[step].fields;
    const valid = await form.trigger(fields as unknown as (keyof FormData)[]);
    if (!valid) return;
    await saveMutation.mutateAsync(form.getValues());
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Nova solicitação médica</CardTitle>
          <span className="text-sm text-slate-500">
            Etapa {step + 1} de {steps.length}
          </span>
        </div>
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
        <form onSubmit={form.handleSubmit(() => {})}>
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
                  <div><Label>Data da solicitação</Label><Input type="date" {...form.register("requestDate")} /></div>
                  <div><Label>Setor de uso</Label><Input {...form.register("usageSector")} placeholder="Centro Cirúrgico — Sala 03" /></div>
                  <div><Label>CRM</Label><Input {...form.register("doctorCrm")} placeholder="123456-SP" /></div>
                  <div><Label>Paciente</Label><Input {...form.register("patientName")} /></div>
                  <div><Label>Prontuário</Label><Input {...form.register("medicalRecord")} /></div>
                </>
              )}
              {step === 1 && (
                <>
                  <div><Label>Procedimento previsto</Label><Input {...form.register("plannedProcedure")} /></div>
                  <div><Label>Data prevista</Label><Input type="date" {...form.register("plannedDate")} /></div>
                  <div><Label>Horário previsto</Label><Input type="time" {...form.register("plannedTime")} /></div>
                  <div><Label>Justificativa clínica</Label><Textarea {...form.register("clinicalJustification")} rows={4} /></div>
                </>
              )}
              {step === 2 && (
                <>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" {...form.register("noInstitutionalAlternative")} className="rounded" />
                    Ausência de alternativa institucional
                  </label>
                  <div><Label>Ganho técnico-assistencial</Label><Textarea {...form.register("technicalBenefit")} /></div>
                  <div><Label>Risco assistencial</Label><Input {...form.register("assistentialRisk")} placeholder="Baixo / Médio / Alto" /></div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" {...form.register("isUrgent")} className="rounded" />
                    Urgência / Emergência
                  </label>
                </>
              )}
              {step === 3 && (
                <>
                  <div><Label>Equipamento</Label><Input {...form.register("equipmentName")} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Marca</Label><Input {...form.register("brand")} /></div>
                    <div><Label>Modelo</Label><Input {...form.register("model")} /></div>
                  </div>
                  <div><Label>Número de série</Label><Input {...form.register("serialNumber")} /></div>
                </>
              )}
              {step === 4 && (
                <>
                  <div><Label>Fornecedor</Label><Input {...form.register("supplierName")} /></div>
                  <div><Label>Proprietário</Label><Input {...form.register("ownerName")} /></div>
                  <div><Label>Contatos</Label><Input {...form.register("ownerContact")} /></div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex gap-3">
            <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft className="h-4 w-4" /> Voltar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => saveMutation.mutate(form.getValues())}
              disabled={saveMutation.isPending}
            >
              <Save className="h-4 w-4" /> Salvar rascunho
            </Button>
            {step < steps.length - 1 ? (
              <Button type="button" className="ml-auto" onClick={nextStep}>
                Próximo <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                className="ml-auto"
                onClick={() => {
                  saveMutation.mutate(form.getValues(), {
                    onSuccess: () => {
                      if (requestId) window.location.href = `/dashboard/medico/solicitacoes/${requestId}/documentos`;
                    },
                  });
                }}
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
