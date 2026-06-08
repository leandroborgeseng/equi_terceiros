"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/gesteq/page-header";
import { Panel } from "@/components/gesteq/panel";

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
    <div className="gesteq-rise space-y-6">
      <PageHeader
        eyebrow="Higienização"
        title="CME / CCIH / NSP"
        subtitle="Registro de eventos adversos e acompanhamento de higienização de equipamentos de terceiros"
      />

      <Panel
        title="Registrar evento adverso"
        eyebrow="Segurança"
        right={<ShieldAlert className="h-5 w-5 text-[var(--bloqueado-ink)]" />}
      >
        <div className="space-y-4">
          <div>
            <Label>Solicitação / equipamento</Label>
            <select
              className="mt-1 w-full rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm"
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
              className="mt-1 w-full rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm"
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
        </div>
      </Panel>

      <section>
        <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--ink)]">
          <AlertTriangle className="h-5 w-5 text-[var(--pendente-ink)]" />
          Eventos registrados
        </h2>
        <div className="space-y-3">
          {events.map((ev) => (
            <Card key={ev.id}>
              <CardContent className="p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-medium">{ev.request.equipmentName}</span>
                  <span className="gesteq-badge gesteq-st-pendente sm">
                    <span className="gesteq-dot" />
                    {ev.severity}
                  </span>
                </div>
                <p className="text-[var(--muted)]">{ev.request.protocol}</p>
                <p className="mt-2">{ev.description}</p>
                <p className="mt-2 text-xs text-[var(--faint)]">
                  {new Date(ev.occurredAt).toLocaleString("pt-BR")} — {ev.reportedBy.name}
                </p>
              </CardContent>
            </Card>
          ))}
          {events.length === 0 && (
            <p className="text-sm text-[var(--muted)]">Nenhum evento adverso registrado.</p>
          )}
        </div>
      </section>
    </div>
  );
}
