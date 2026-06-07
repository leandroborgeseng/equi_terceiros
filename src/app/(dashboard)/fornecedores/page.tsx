"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

type Supplier = {
  id: string;
  name: string;
  cnpj?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  requestsCount: number;
};

export default function FornecedoresPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", cnpj: "", email: "", phone: "", address: "" });
  const [error, setError] = useState<string | null>(null);

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["suppliers"],
    queryFn: () => fetch("/api/suppliers").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao cadastrar fornecedor");
      return data;
    },
    onSuccess: () => {
      setForm({ name: "", cnpj: "", email: "", phone: "", address: "" });
      setError(null);
      qc.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fornecedores</h1>
        <p className="text-sm text-slate-500">
          Cadastro de empresas (pessoa jurídica) proprietárias de equipamentos de terceiros.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" /> Novo fornecedor
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Razão social *</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label>CNPJ *</Label>
            <Input value={form.cnpj} onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))} />
          </div>
          <div>
            <Label>E-mail *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Label>Endereço</Label>
            <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </div>
          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Salvando..." : "Cadastrar fornecedor"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-semibold text-slate-900">Fornecedores cadastrados</h2>
        {(suppliers ?? []).length === 0 && (
          <p className="text-sm text-slate-500">Nenhum fornecedor cadastrado.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {(suppliers ?? []).map((s) => (
            <Card key={s.id}>
              <CardContent className="space-y-1 py-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <Badge variant="info">{s.requestsCount} equip.</Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {s.cnpj ? `CNPJ ${s.cnpj} · ` : ""}
                  {s.email}
                  {s.phone ? ` · ${s.phone}` : ""}
                </p>
                {s.address && <p className="text-xs text-slate-400">{s.address}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
