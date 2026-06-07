"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Copy } from "lucide-react";
import {
  NOVO_EQUIPAMENTO_DEFAULTS,
  buildDuplicateForm,
  type DuplicateSourceRequest,
  type NovoEquipamentoForm,
} from "@/lib/duplicate-equipment";

type Supplier = {
  id: string;
  name: string;
  email: string;
  cnpj?: string | null;
  phone?: string | null;
  address?: string | null;
};

export default function NovoEquipamentoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromId = searchParams.get("from");
  const prefilled = useRef(false);

  const [error, setError] = useState<string | null>(null);
  const [duplicateSource, setDuplicateSource] = useState<string | null>(null);
  const [form, setForm] = useState<NovoEquipamentoForm>(NOVO_EQUIPAMENTO_DEFAULTS);

  const {
    data: sourceRequest,
    isLoading: loadingSource,
    isError: sourceError,
  } = useQuery<DuplicateSourceRequest>({
    queryKey: ["duplicate-source", fromId],
    queryFn: async () => {
      const res = await fetch(`/api/requests/${fromId}`);
      if (!res.ok) throw new Error("Equipamento de origem não encontrado");
      return res.json();
    },
    enabled: !!fromId,
    retry: false,
  });

  useEffect(() => {
    if (!sourceRequest || prefilled.current) return;
    prefilled.current = true;
    const { form: next, sourceLabel } = buildDuplicateForm(sourceRequest);
    setForm(next);
    setDuplicateSource(sourceLabel);
  }, [sourceRequest]);

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["suppliers"],
    queryFn: () => fetch("/api/suppliers").then((r) => r.json()),
  });

  const { data: invoices } = useQuery<
    { id: string; number: string; issueDate?: string | null; fileKey?: string | null; fileName?: string | null }[]
  >({
    queryKey: ["invoices"],
    queryFn: () => fetch("/api/invoices").then((r) => r.json()),
  });

  const invoicesWithAttachment = (invoices ?? []).filter((inv) => inv.fileKey);

  const { data: sectors } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["sectors"],
    queryFn: () => fetch("/api/sectors").then((r) => r.json()),
  });

  const set = (k: keyof NovoEquipamentoForm, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const onSupplierSelect = (id: string) => {
    const s = suppliers?.find((x) => x.id === id);
    if (!s) {
      setForm((f) => ({ ...f, supplierId: "" }));
      return;
    }
    setForm((f) => ({
      ...f,
      supplierId: id,
      supplierName: s.name,
      ownerContact: f.ownerContact || s.phone || s.email || "",
      ownerDocument: f.ownerDocument || s.cnpj || "",
    }));
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

  const isDuplicate = !!fromId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isDuplicate ? "Duplicar equipamento" : "Novo equipamento"}
        </h1>
        <p className="text-sm text-slate-500">
          {isDuplicate
            ? "Dados copiados do cadastro anterior. Ajuste série, patrimônio e demais campos pertinentes."
            : "Cadastro originado pela Engenharia Clínica. Entra direto em homologação (checklist + inspeção)."}
        </p>
      </div>

      {loadingSource && isDuplicate && (
        <p className="text-sm text-slate-500">Carregando dados para duplicar...</p>
      )}

      {sourceError && isDuplicate && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Não foi possível carregar o equipamento de origem.{" "}
          <Link href="/equipamentos/novo" className="font-medium underline">
            Cadastrar em branco
          </Link>
        </div>
      )}

      {duplicateSource && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex items-start gap-2 text-sm text-blue-900">
              <Copy className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Duplicando de {duplicateSource}</p>
                <p className="text-xs text-blue-700">
                  Número de série, patrimônio e autorização da diretoria foram limpos — preencha com os
                  dados do novo item.
                </p>
              </div>
            </div>
            <Link href="/equipamentos/novo" className="text-xs text-blue-700 hover:underline">
              Começar em branco
            </Link>
          </CardContent>
        </Card>
      )}

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
            <Input
              value={form.serialNumber}
              onChange={(e) => set("serialNumber", e.target.value)}
              placeholder={isDuplicate ? "Informe a série do novo equipamento" : undefined}
              autoFocus={isDuplicate}
            />
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
            <Input
              value={form.usageSector}
              onChange={(e) => set("usageSector", e.target.value)}
              list="setores-list"
            />
            <datalist id="setores-list">
              {(sectors ?? []).map((s) => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
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
          <CardTitle>Empresa (pessoa jurídica)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Empresa cadastrada</Label>
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
            <Label>Razão social *</Label>
            <Input
              value={form.supplierName}
              onChange={(e) => set("supplierName", e.target.value)}
              placeholder="Nome da empresa"
            />
          </div>
          <div>
            <Label>CNPJ *</Label>
            <Input value={form.ownerDocument} onChange={(e) => set("ownerDocument", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Contato (telefone ou e-mail) *</Label>
            <Input value={form.ownerContact} onChange={(e) => set("ownerContact", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nota fiscal</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Vincular a uma NF cadastrada (opcional)</Label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.invoiceId}
              onChange={(e) => set("invoiceId", e.target.value)}
            >
              <option value="">— Nenhuma por enquanto —</option>
              {invoicesWithAttachment.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  NF {inv.number}
                  {inv.fileName ? ` · ${inv.fileName}` : ""}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Uma NF com anexo pode ser compartilhada por vários equipamentos.{" "}
              <Link href="/notas-fiscais" className="text-emerald-600 hover:underline">
                Cadastre a nota fiscal
              </Link>{" "}
              (com anexo obrigatório) e vincule aqui ou depois na tela de Notas Fiscais.
            </p>
            {invoicesWithAttachment.length === 0 && (
              <p className="mt-1 text-xs text-amber-700">
                Nenhuma NF com anexo disponível. Cadastre em Notas Fiscais antes de vincular.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <Button
          size="lg"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || (isDuplicate && loadingSource)}
        >
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
