"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/gesteq/page-header";
import { Panel } from "@/components/gesteq/panel";
import { Search, Plus, Mail, Phone, MapPin, Package } from "lucide-react";

type Supplier = {
  id: string;
  name: string;
  cnpj?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  requestsCount: number;
};

function supplierInitials(name: string) {
  return name
    .replace(/[^A-Za-zÀ-ÿ ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function FornecedoresPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", cnpj: "", email: "", phone: "", address: "" });
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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

  const filtered = useMemo(() => {
    const list = suppliers ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((f) =>
      [f.name, f.cnpj, f.email, f.address].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [suppliers, search]);

  return (
    <div className="gesteq-rise space-y-5">
      <PageHeader
        eyebrow="Cadastro"
        title="Fornecedores"
        subtitle={`${(suppliers ?? []).length} proprietários cadastrados`}
      />

      <div className="grid items-start gap-4 lg:grid-cols-[360px_1fr]">
        <Panel title="Novo fornecedor" eyebrow="Cadastro">
          <div className="grid gap-3">
            <div>
              <Label>Razão social / nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex.: MedSupply Ltda"
              />
            </div>
            <div>
              <Label>CNPJ *</Label>
              <Input
                className="font-mono-data"
                value={form.cnpj}
                onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <Label>E-mail *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                className="font-mono-data"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Cidade / UF"
              />
            </div>
            {error && <p className="text-sm text-[var(--bloqueado-ink)]">{error}</p>}
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              <Plus className="h-4 w-4" />
              {createMutation.isPending ? "Salvando..." : "Cadastrar fornecedor"}
            </Button>
          </div>
        </Panel>

        <div>
          <div className="relative mb-3 max-w-[340px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
            <Input
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar fornecedor, CNPJ, cidade…"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
            {filtered.map((s) => (
              <div key={s.id} className="gesteq-card p-4">
                <div className="mb-3 flex items-start gap-3">
                  <div className="font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--brand-soft)] text-[15px] font-semibold text-[var(--brand-ink)]">
                    {supplierInitials(s.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-semibold leading-tight text-[var(--ink)]">{s.name}</div>
                    {s.cnpj && (
                      <div className="font-mono-data mt-0.5 text-[11.5px] text-[var(--faint)]">{s.cnpj}</div>
                    )}
                  </div>
                </div>
                <div className="grid gap-1 text-[12.5px] text-[var(--muted)]">
                  <span className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-[var(--faint)]" />
                    {s.email}
                  </span>
                  {s.phone && (
                    <span className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-[var(--faint)]" />
                      {s.phone}
                    </span>
                  )}
                  {s.address && (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[var(--faint)]" />
                      {s.address}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex gap-2 border-t border-[var(--line-2)] pt-3">
                  <span className="gesteq-badge gesteq-st-liberado sm">
                    <Package className="h-3 w-3" />
                    {s.requestsCount} equip.
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="py-8 text-sm text-[var(--muted)]">Nenhum fornecedor encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
