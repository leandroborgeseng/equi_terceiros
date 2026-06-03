"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { AlertTriangle, ShieldAlert } from "lucide-react";

type AdverseEvent = {
  id: string;
  description: string;
  severity: string;
  occurredAt: string;
  request: { protocol: string; equipmentName: string };
  reportedBy: { name: string };
};

export default function CmePage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    requestId: "",
    description: "",
    severity: "MODERADO",
    occurredAt: new Date().toISOString().slice(0, 16),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["adverse-events"],
    queryFn: () => fetch("/api/adverse-events").then((r) => r.json()) as Promise<AdverseEvent[]>,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["requests", "cme"],
    queryFn: () => fetch("/api/requests?queue=liberados").then((r) => r.json()) as Promise<
      { id: string; protocol: string; equipmentName: string }[]
    >,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/adverse-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao registrar");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adverse-events"] });
      setForm((f) => ({ ...f, description: "", requestId: "" }));
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">CME / CCIH / NSP</h1>
        <p className="text-slate-500">
          Registro de eventos adversos e acompanhamento de higienização de equipamentos de terceiros.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            Registrar evento adverso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Solicitação / equipamento</Label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.requestId}
              onChange={(e) => setForm({ ...form, requestId: e.target.value })}
            >
              <option value="">Selecione...</option>
              {requests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.protocol} — {r.equipmentName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Severidade</Label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
            >
              <option value="LEVE">Leve</option>
              <option value="MODERADO">Moderado</option>
              <option value="GRAVE">Grave</option>
            </select>
          </div>
          <div>
            <Label>Data/hora do evento</Label>
            <Input
              type="datetime-local"
              value={form.occurredAt}
              onChange={(e) => setForm({ ...form, occurredAt: e.target.value })}
            />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descreva o evento, ação imediata e equipamento envolvido..."
            />
          </div>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !form.requestId || form.description.length < 10}
          >
            {createMutation.isPending ? "Salvando..." : "Registrar evento"}
          </Button>
          {createMutation.error && (
            <p className="text-sm text-red-600">{(createMutation.error as Error).message}</p>
          )}
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Eventos registrados
        </h2>
        <div className="space-y-3">
          {events.map((ev) => (
            <Card key={ev.id}>
              <CardContent className="p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-medium">{ev.request.equipmentName}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                    {ev.severity}
                  </span>
                </div>
                <p className="text-slate-500">{ev.request.protocol}</p>
                <p className="mt-2">{ev.description}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(ev.occurredAt).toLocaleString("pt-BR")} — {ev.reportedBy.name}
                </p>
              </CardContent>
            </Card>
          ))}
          {events.length === 0 && (
            <p className="text-sm text-slate-500">Nenhum evento adverso registrado.</p>
          )}
        </div>
      </section>
    </div>
  );
}
