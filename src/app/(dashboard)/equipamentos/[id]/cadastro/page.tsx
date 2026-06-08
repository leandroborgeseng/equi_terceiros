"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { EQUIPMENT_CLASS_LABELS, type EquipmentClass } from "@/lib/enums";
import { PageHeader } from "@/components/gesteq/page-header";

export default function CadastroEcPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: request } = useQuery({
    queryKey: ["request", id],
    queryFn: () => fetch(`/api/requests/${id}`).then((r) => r.json()),
  });

  const [form, setForm] = useState({
    serialNumber: "",
    originPatrimony: "",
    equipmentClass: "C" as EquipmentClass,
    destinationSector: "",
    entryDate: new Date().toISOString().slice(0, 10),
    expectedExitDate: "",
    storageLocation: "",
    boardAuthorization: "",
    observations: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (request) {
      setForm((f) => ({
        ...f,
        serialNumber: request.serialNumber || f.serialNumber,
        equipmentClass: (request.equipmentClass as EquipmentClass) ?? f.equipmentClass,
        destinationSector: request.destinationSector || request.usageSector || f.destinationSector,
      }));
    }
  }, [request]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/requests/${id}/registration`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          expectedExitDate: form.expectedExitDate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.toString?.() ?? "Erro ao cadastrar");
      return data;
    },
    onSuccess: () => router.push(`/dashboard/engenharia/solicitacoes/${id}`),
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="gesteq-rise mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Engenharia Clínica"
        title="Cadastro do equipamento"
        subtitle={`Recebimento e registro${request?.protocol ? ` · ${request.protocol}` : ""}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Dados de recebimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Número de série *</Label>
              <Input
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              />
            </div>
            <div>
              <Label>Patrimônio de origem</Label>
              <Input
                value={form.originPatrimony}
                onChange={(e) => setForm({ ...form, originPatrimony: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Classe do equipamento *</Label>
            <select
              className="mt-1 w-full rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm"
              value={form.equipmentClass}
              onChange={(e) =>
                setForm({ ...form, equipmentClass: e.target.value as EquipmentClass })
              }
            >
              {(Object.keys(EQUIPMENT_CLASS_LABELS) as EquipmentClass[]).map((c) => (
                <option key={c} value={c}>
                  {EQUIPMENT_CLASS_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Setor de destino *</Label>
              <Input
                value={form.destinationSector}
                onChange={(e) => setForm({ ...form, destinationSector: e.target.value })}
              />
            </div>
            <div>
              <Label>Local de armazenamento</Label>
              <Input
                value={form.storageLocation}
                onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
              />
            </div>
            <div>
              <Label>Data de entrada *</Label>
              <Input
                type="date"
                value={form.entryDate}
                onChange={(e) => setForm({ ...form, entryDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Previsão de saída</Label>
              <Input
                type="date"
                value={form.expectedExitDate}
                onChange={(e) => setForm({ ...form, expectedExitDate: e.target.value })}
              />
            </div>
          </div>

          {form.equipmentClass === "A" && (
            <div>
              <Label>Autorização da diretoria (obrigatória p/ Classe A) *</Label>
              <Input
                value={form.boardAuthorization}
                onChange={(e) => setForm({ ...form, boardAuthorization: e.target.value })}
                placeholder="Nº/identificação da autorização formal"
              />
            </div>
          )}

          <div>
            <Label>Observações</Label>
            <Textarea
              value={form.observations}
              onChange={(e) => setForm({ ...form, observations: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Salvando..." : "Salvar cadastro (gera OS interna)"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
