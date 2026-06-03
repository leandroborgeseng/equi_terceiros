"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, KeyRound, Ban, RotateCcw } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Invite = {
  id: string;
  key: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string | null;
  doctorCrm?: string | null;
  entryType: string;
  note?: string | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  usageCount: number;
  expired: boolean;
};

export default function ConvitesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    doctorCrm: "",
    entryType: "MEDICO",
    note: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const { data: invites } = useQuery<Invite[]>({
    queryKey: ["invites"],
    queryFn: () => fetch("/api/invites").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar chave");
      return data;
    },
    onSuccess: () => {
      setForm({ requesterName: "", requesterEmail: "", requesterPhone: "", doctorCrm: "", entryType: "MEDICO", note: "" });
      setError(null);
      qc.invalidateQueries({ queryKey: ["invites"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const revokeMutation = useMutation({
    mutationFn: async ({ id, revoke }: { id: string; revoke: boolean }) => {
      const res = await fetch(`/api/invites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revoke }),
      });
      if (!res.ok) throw new Error("Erro");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invites"] }),
  });

  const linkFor = (key: string) =>
    `${typeof window !== "undefined" ? window.location.origin : ""}/solicitar/${key}`;

  const copyLink = (key: string) => {
    navigator.clipboard?.writeText(linkFor(key));
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  function statusBadge(i: Invite) {
    if (i.revokedAt) return <Badge variant="danger">Revogada</Badge>;
    if (i.expired) return <Badge variant="grayDark">Expirada</Badge>;
    return <Badge variant="success">Ativa</Badge>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chaves de acesso</h1>
        <p className="text-sm text-slate-500">
          Gere uma chave e envie ao médico ou empresa para solicitar sem login. Validade de 30 dias,
          reutilizável até expirar ou ser revogada.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-emerald-600" /> Gerar nova chave
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Nome do solicitante *</Label>
            <Input
              value={form.requesterName}
              onChange={(e) => setForm((f) => ({ ...f, requesterName: e.target.value }))}
            />
          </div>
          <div>
            <Label>E-mail *</Label>
            <Input
              type="email"
              value={form.requesterEmail}
              onChange={(e) => setForm((f) => ({ ...f, requesterEmail: e.target.value }))}
            />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input
              value={form.requesterPhone}
              onChange={(e) => setForm((f) => ({ ...f, requesterPhone: e.target.value }))}
            />
          </div>
          <div>
            <Label>CRM (se médico)</Label>
            <Input
              value={form.doctorCrm}
              onChange={(e) => setForm((f) => ({ ...f, doctorCrm: e.target.value }))}
            />
          </div>
          <div>
            <Label>Tipo</Label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.entryType}
              onChange={(e) => setForm((f) => ({ ...f, entryType: e.target.value }))}
            >
              <option value="MEDICO">Médico</option>
              <option value="FORNECEDOR">Fornecedor</option>
              <option value="COMODATO">Comodato</option>
              <option value="ALUGUEL">Aluguel</option>
              <option value="DEMONSTRACAO">Demonstração</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>
          <div>
            <Label>Observação (opcional)</Label>
            <Input
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </div>
          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Gerando..." : "Gerar chave e link"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-semibold text-slate-900">Chaves geradas</h2>
        {(invites ?? []).length === 0 && (
          <p className="text-sm text-slate-500">Nenhuma chave gerada ainda.</p>
        )}
        {(invites ?? []).map((i) => (
          <Card key={i.id}>
            <CardContent className="space-y-3 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">
                    {i.requesterName}{" "}
                    <span className="text-xs font-normal text-slate-500">· {i.entryType}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {i.requesterEmail}
                    {i.requesterPhone ? ` · ${i.requesterPhone}` : ""}
                    {i.doctorCrm ? ` · CRM ${i.doctorCrm}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(i)}
                  <Badge variant="info">{i.usageCount} solicitação(ões)</Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-2 text-xs">
                <span className="truncate font-mono">{linkFor(i.key)}</span>
                <button
                  type="button"
                  onClick={() => copyLink(i.key)}
                  className="shrink-0 rounded-md bg-white p-1.5 ring-1 ring-slate-200"
                  aria-label="Copiar link"
                >
                  <Copy className="h-4 w-4" />
                </button>
                {copied === i.key && <span className="text-emerald-600">copiado!</span>}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Criada em {formatDate(i.createdAt)}
                  {i.expiresAt ? ` · expira em ${formatDate(i.expiresAt)}` : ""}
                </span>
                {i.revokedAt ? (
                  <button
                    onClick={() => revokeMutation.mutate({ id: i.id, revoke: false })}
                    className="flex items-center gap-1 text-emerald-600 hover:underline"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reativar
                  </button>
                ) : (
                  <button
                    onClick={() => revokeMutation.mutate({ id: i.id, revoke: true })}
                    className="flex items-center gap-1 text-red-600 hover:underline"
                  >
                    <Ban className="h-3.5 w-3.5" /> Revogar
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
