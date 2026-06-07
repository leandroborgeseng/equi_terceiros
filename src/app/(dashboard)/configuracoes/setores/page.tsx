"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Setores</h1>
        <p className="text-sm text-slate-500">
          Setores assistenciais usados como sugestão nos formulários de solicitação e cadastro.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" /> Novo setor
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-48">
            <Label>Nome do setor</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Centro Cirúrgico — Sala 03" />
          </div>
          <Button onClick={() => create.mutate()} disabled={create.isPending || name.trim().length < 2}>
            {create.isPending ? "Salvando..." : "Adicionar"}
          </Button>
        </CardContent>
      </Card>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-2 sm:grid-cols-2">
        {(sectors ?? []).map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-slate-800">{s.name}</span>
              <div className="flex items-center gap-2">
                <Badge variant={s.active ? "success" : "default"}>{s.active ? "Ativo" : "Inativo"}</Badge>
                <button
                  onClick={() => toggle.mutate({ id: s.id, active: !s.active })}
                  className="text-xs text-slate-500 hover:underline"
                >
                  {s.active ? "Desativar" : "Ativar"}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        {(sectors ?? []).length === 0 && (
          <p className="text-sm text-slate-500">Nenhum setor cadastrado.</p>
        )}
      </div>
    </div>
  );
}
