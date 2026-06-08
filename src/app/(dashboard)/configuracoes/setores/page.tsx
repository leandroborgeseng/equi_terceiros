"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/gesteq/page-header";
import { Panel } from "@/components/gesteq/panel";

type Sector = { id: string; name: string; active: boolean };

export default function SetoresPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: sectors } = useQuery<Sector[]>({
    queryKey: ["sectors"],
    queryFn: () => fetch("/api/sectors").then((r) => r.json()),
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/sectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro");
      return data;
    },
    onSuccess: () => {
      setName("");
      setError(null);
      qc.invalidateQueries({ queryKey: ["sectors"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await fetch(`/api/sectors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error("Erro");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sectors"] }),
  });

  return (
    <div className="gesteq-rise space-y-6">
      <PageHeader
        eyebrow="Administração"
        title="Setores"
        subtitle="Setores assistenciais usados como sugestão nos formulários de solicitação e cadastro"
      />

      <Panel title="Novo setor" right={<Building2 className="h-5 w-5 text-[var(--brand)]" />}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-48">
            <Label>Nome do setor</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Centro Cirúrgico — Sala 03" />
          </div>
          <Button onClick={() => create.mutate()} disabled={create.isPending || name.trim().length < 2}>
            {create.isPending ? "Salvando..." : "Adicionar"}
          </Button>
        </div>
      </Panel>
      {error && <p className="text-sm text-[var(--bloqueado-ink)]">{error}</p>}

      <div className="grid gap-2 sm:grid-cols-2">
        {(sectors ?? []).map((s) => (
          <div key={s.id} className="gesteq-card flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-[var(--ink)]">{s.name}</span>
            <div className="flex items-center gap-2">
              <Badge variant={s.active ? "success" : "default"}>{s.active ? "Ativo" : "Inativo"}</Badge>
              <button
                onClick={() => toggle.mutate({ id: s.id, active: !s.active })}
                className="text-xs text-[var(--muted)] hover:underline"
              >
                {s.active ? "Desativar" : "Ativar"}
              </button>
            </div>
          </div>
        ))}
        {(sectors ?? []).length === 0 && (
          <p className="text-sm text-[var(--muted)]">Nenhum setor cadastrado.</p>
        )}
      </div>
    </div>
  );
}
