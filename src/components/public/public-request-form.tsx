"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { publicRequestSchema, type PublicRequestInput } from "@/lib/validators/request";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Copy } from "lucide-react";

export type PublicPrefill = {
  requesterName?: string;
  requesterEmail?: string;
  requesterPhone?: string;
  doctorCrm?: string;
  entryType?: PublicRequestInput["entryType"];
};

export function PublicRequestForm({
  prefill,
  inviteKey,
}: {
  prefill?: PublicPrefill;
  inviteKey?: string;
}) {
  const [result, setResult] = useState<{ protocol: string; supplierToken: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PublicRequestInput>({
    resolver: zodResolver(publicRequestSchema),
    defaultValues: {
      plannedDate: new Date().toISOString().slice(0, 10),
      plannedTime: "08:00",
      entryType: prefill?.entryType ?? "MEDICO",
      isUrgent: false,
      noInstitutionalAlternative: false,
      requesterName: prefill?.requesterName ?? "",
      requesterEmail: prefill?.requesterEmail ?? "",
      requesterPhone: prefill?.requesterPhone ?? "",
      doctorCrm: prefill?.doctorCrm ?? "",
    },
    mode: "onTouched",
  });

  const mutation = useMutation({
    mutationFn: async (values: PublicRequestInput) => {
      const res = await fetch("/api/public/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, inviteKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar solicitação");
      return data as { protocol: string; supplierToken: string };
    },
    onSuccess: (data) => {
      setResult(data);
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  const errors = form.formState.errors;
  const uploadUrl = result ? `/fornecedor/${result.supplierToken}` : "";

  if (result) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <CardTitle>Solicitação enviada!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div>
              <p className="text-sm text-slate-500">Protocolo</p>
              <p className="text-2xl font-bold text-slate-900">{result.protocol}</p>
            </div>
            <p className="text-sm text-slate-600">
              Agora envie as <strong>fotos e documentos</strong> do equipamento pelo link abaixo. A
              Engenharia Clínica fará a avaliação e liberação.
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-2 text-xs">
              <span className="truncate">
                {typeof window !== "undefined" ? window.location.origin : ""}
                {uploadUrl}
              </span>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${uploadUrl}`)}
                className="shrink-0 rounded-md bg-white p-1.5 ring-1 ring-slate-200"
                aria-label="Copiar link"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <Link href={uploadUrl}>
              <Button className="w-full" size="lg">
                Enviar fotos e documentos agora
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identificação do solicitante</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Nome *</Label>
            <Input {...form.register("requesterName")} placeholder="Nome completo / responsável" />
          </div>
          <div>
            <Label>E-mail *</Label>
            <Input type="email" {...form.register("requesterEmail")} />
          </div>
          <div>
            <Label>Telefone *</Label>
            <Input {...form.register("requesterPhone")} placeholder="(11) 90000-0000" />
          </div>
          <div>
            <Label>CRM (se médico)</Label>
            <Input {...form.register("doctorCrm")} placeholder="123456-SP" />
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Procedimento e uso</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Setor de uso *</Label>
            <Input {...form.register("usageSector")} placeholder="Centro Cirúrgico — Sala 03" />
          </div>
          <div>
            <Label>Procedimento previsto *</Label>
            <Input {...form.register("plannedProcedure")} />
          </div>
          <div>
            <Label>Data prevista *</Label>
            <Input type="date" {...form.register("plannedDate")} />
          </div>
          <div>
            <Label>Horário previsto *</Label>
            <Input type="time" {...form.register("plannedTime")} />
          </div>
          <div className="sm:col-span-2">
            <Label>Justificativa clínica *</Label>
            <Textarea rows={3} {...form.register("clinicalJustification")} />
          </div>
          <div>
            <Label>Paciente (opcional)</Label>
            <Input {...form.register("patientName")} />
          </div>
          <div>
            <Label>Prontuário (opcional)</Label>
            <Input {...form.register("medicalRecord")} />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" {...form.register("isUrgent")} className="rounded" />
            Urgência / Emergência (fluxo Classe D)
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipamento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Nome do equipamento *</Label>
            <Input {...form.register("equipmentName")} />
          </div>
          <div>
            <Label>Marca *</Label>
            <Input {...form.register("brand")} />
          </div>
          <div>
            <Label>Modelo *</Label>
            <Input {...form.register("model")} />
          </div>
          <div>
            <Label>Número de série (se disponível)</Label>
            <Input {...form.register("serialNumber")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Empresa (pessoa jurídica)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Razão social *</Label>
            <Input {...form.register("supplierName")} />
          </div>
          <div>
            <Label>CNPJ *</Label>
            <Input {...form.register("ownerDocument")} />
          </div>
          <div className="sm:col-span-2">
            <Label>Contato (telefone ou e-mail) *</Label>
            <Input {...form.register("ownerContact")} />
          </div>
        </CardContent>
      </Card>

      {(Object.keys(errors).length > 0 || error) && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error && <p>{error}</p>}
          {Object.values(errors).map((e, i) => (
            <p key={i}>{(e as { message?: string })?.message}</p>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? "Enviando..." : "Enviar solicitação"}
        </Button>
        <Link href="/login" className="text-sm text-slate-500 hover:underline">
          Entrar na plataforma
        </Link>
      </div>
    </form>
  );
}
