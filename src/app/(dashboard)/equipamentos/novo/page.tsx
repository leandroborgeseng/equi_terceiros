"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";

type Supplier = { id: string; name: string; email: string };

export default function NovoEquipamentoPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    equipmentName: "",
    brand: "",
    model: "",
    serialNumber: "",
    equipmentClass: "B",
    entryType: "FORNECEDOR",
    usageSector: "",
    supplierId: "",
    supplierName: "",
    ownerName: "",
    ownerContact: "",
    ownerDocument: "",
    originPatrimony: "",
    storageLocation: "",
    boardAuthorization: "",
    observations: "",
    alreadyInPark: false,
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["suppliers"],
    queryFn: () => fetch("/api/suppliers").then((r) => r.json()),
  });

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const onSupplierSelect = (id: string) => {
    const s = suppliers?.find((x) => x.id === id);
    setForm((f) => ({ ...f, supplierId: id, supplierName: s ? s.name : f.supplierName }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/equipamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao cadastrar equipamento");
      return data;
    },
    onSuccess: (data) => router.push(`/dashboard/engenharia/solicitacoes/${data.id}`),
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Novo equipamento</h1>
        <p className="text-sm text-slate-500">
          Cadastro originado pela Engenharia Clínica. Entra direto em homologação (checklist +
          inspeção).
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50/40">
        <CardContent className="py-4">
          <label className="flex items-center gap-2 text-sm font-medium text-amber-900">
            <input
              type="checkbox"
              checked={form.alreadyInPark}
              onChange={(e) => set("alreadyInPark", e.target.checked)}
              className="rounded"
            />
            Equipamento já está no parque tecnológico (apenas formalizar)
          </label>
          <p className="mt-1 text-xs text-amber-700">
            Marque para regularizar documentação de um equipamento que já está em uso. O fluxo de
            checklist e inspeção é mantido para garantir o compliance.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipamento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Nome do equipamento *</Label>
            <Input value={form.equipmentName} onChange={(e) => set("equipmentName", e.target.value)} />
          </div>
          <div>
            <Label>Marca *</Label>
            <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} />
          </div>
          <div>
            <Label>Modelo *</Label>
            <Input value={form.model} onChange={(e) => set("model", e.target.value)} />
          </div>
          <div>
            <Label>Número de série *</Label>
            <Input value={form.serialNumber} onChange={(e) => set("serialNumber", e.target.value)} />
          </div>
          <div>
            <Label>Patrimônio de origem</Label>
            <Input value={form.originPatrimony} onChange={(e) => set("originPatrimony", e.target.value)} />
          </div>
          <div>
            <Label>Classe *</Label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.equipmentClass}
              onChange={(e) => set("equipmentClass", e.target.value)}
            >
              <option value="A">A — Permanência contínua (&gt;30 dias)</option>
              <option value="B">B — Temporário programado</option>
              <option value="C">C — Esporádico</option>
              <option value="D">D — Urgência/Emergência</option>
            </select>
          </div>
          <div>
            <Label>Tipo de ingresso</Label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.entryType}
              onChange={(e) => set("entryType", e.target.value)}
            >
              <option value="FORNECEDOR">Fornecedor</option>
              <option value="COMODATO">Comodato</option>
              <option value="ALUGUEL">Aluguel</option>
              <option value="DEMONSTRACAO">Demonstração</option>
              <option value="MEDICO">Médico</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label>Setor de uso/destino *</Label>
            <Input value={form.usageSector} onChange={(e) => set("usageSector", e.target.value)} />
          </div>
          <div>
            <Label>Local de armazenamento</Label>
            <Input value={form.storageLocation} onChange={(e) => set("storageLocation", e.target.value)} />
          </div>
          {form.equipmentClass === "A" && (
            <div>
              <Label>Autorização da diretoria (Classe A) *</Label>
              <Input value={form.boardAuthorization} onChange={(e) => set("boardAuthorization", e.target.value)} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fornecedor / proprietário</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Fornecedor cadastrado</Label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.supplierId}
              onChange={(e) => onSupplierSelect(e.target.value)}
            >
              <option value="">— Selecionar ou digitar abaixo —</option>
              {(suppliers ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Não está na lista?{" "}
              <Link href="/fornecedores" className="text-emerald-600 hover:underline">
                Cadastrar fornecedor
              </Link>{" "}
              ou preencha o nome abaixo.
            </p>
          </div>
          <div>
            <Label>Fornecedor / empresa *</Label>
            <Input
              value={form.supplierName}
              onChange={(e) => set("supplierName", e.target.value)}
              placeholder="Nome do fornecedor"
            />
          </div>
          <div>
            <Label>Proprietário *</Label>
            <Input value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} />
          </div>
          <div>
            <Label>Contato do proprietário *</Label>
            <Input value={form.ownerContact} onChange={(e) => set("ownerContact", e.target.value)} />
          </div>
          <div>
            <Label>CNPJ/CPF</Label>
            <Input value={form.ownerDocument} onChange={(e) => set("ownerDocument", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <Button size="lg" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending
            ? "Salvando..."
            : form.alreadyInPark
              ? "Cadastrar e iniciar formalização"
              : "Cadastrar e enviar para homologação"}
        </Button>
        <Link href="/equipamentos" className="text-sm text-slate-500 hover:underline">
          Cancelar
        </Link>
      </div>
    </div>
  );
}
