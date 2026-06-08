"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PlayCircle, PackageOpen, LogOut, Warehouse } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type StorageRecord = { id: string; location: string; storedAt: string; storedBy?: string | null; notes?: string | null };
type WithdrawalRecord = { id: string; withdrawnAt: string; withdrawnBy: string; reason?: string | null; completed: boolean };

const LIFECYCLE_STATUSES = [
  "LIBERADO",
  "LIBERADO_COM_RESTRICAO",
  "EM_USO",
  "AGUARDANDO_RETIRADA",
  "RETIRADO",
];

export function LifecyclePanel({
  requestId,
  status,
  storageRecords = [],
  withdrawalRecords = [],
}: {
  requestId: string;
  status: string;
  storageRecords?: StorageRecord[];
  withdrawalRecords?: WithdrawalRecord[];
}) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [withdrawnBy, setWithdrawnBy] = useState("");
  const [reason, setReason] = useState("");
  const [location, setLocation] = useState("");
  const [storageNotes, setStorageNotes] = useState("");

  const refresh = () => qc.invalidateQueries({ queryKey: ["request", requestId] });

  const lifecycle = useMutation({
    mutationFn: async (payload: { action: string; withdrawnBy?: string; reason?: string }) => {
      const res = await fetch(`/api/requests/${requestId}/lifecycle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao atualizar");
      return data;
    },
    onSuccess: () => {
      setError(null);
      refresh();
    },
    onError: (e: Error) => setError(e.message),
  });

  const storage = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/requests/${requestId}/storage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, notes: storageNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao registrar armazenamento");
      return data;
    },
    onSuccess: () => {
      setError(null);
      setLocation("");
      setStorageNotes("");
      refresh();
    },
    onError: (e: Error) => setError(e.message),
  });

  // Só faz sentido depois da liberação
  if (!LIFECYCLE_STATUSES.includes(status)) {
    return (
      <div className="text-sm text-[var(--muted)]">
        As ações de ciclo de vida (em uso, armazenamento e retirada) ficam disponíveis após a
        liberação do equipamento.
      </div>
    );
  }

  const canUse = status === "LIBERADO" || status === "LIBERADO_COM_RESTRICAO";
  const isRetirado = status === "RETIRADO";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-[var(--ink)]">Ciclo de vida</h3>
        <span className="gesteq-badge gesteq-st-emuso sm">
          <span className="gesteq-dot" />
          {status.replace(/_/g, " ")}
        </span>
      </div>

      {!isRetirado && (
        <div className="flex flex-wrap gap-2">
          {canUse && (
            <Button
              variant="secondary"
              onClick={() => lifecycle.mutate({ action: "EM_USO" })}
              disabled={lifecycle.isPending}
            >
              <PlayCircle className="h-4 w-4" /> Marcar em uso
            </Button>
          )}
          {(status === "EM_USO" || canUse) && (
            <Button
              variant="outline"
              onClick={() => lifecycle.mutate({ action: "AGUARDANDO_RETIRADA" })}
              disabled={lifecycle.isPending}
            >
              <PackageOpen className="h-4 w-4" /> Aguardando retirada
            </Button>
          )}
        </div>
      )}

      {/* Registrar retirada definitiva */}
      {!isRetirado && (
        <div className="rounded-[var(--r-lg)] border border-[var(--line)] p-3">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[var(--ink-2)]">
            <LogOut className="h-4 w-4" /> Registrar retirada (encerra o ciclo)
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label>Retirado por *</Label>
              <Input value={withdrawnBy} onChange={(e) => setWithdrawnBy(e.target.value)} placeholder="Nome do responsável" />
            </div>
            <div>
              <Label>Motivo / observação</Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>
          <Button
            className="mt-3"
            onClick={() => {
              if (!withdrawnBy.trim()) {
                setError("Informe quem retirou o equipamento");
                return;
              }
              lifecycle.mutate({ action: "RETIRADO", withdrawnBy, reason });
            }}
            disabled={lifecycle.isPending}
          >
            Confirmar retirada
          </Button>
        </div>
      )}

      {/* Armazenamento */}
      {!isRetirado && (
        <div className="rounded-[var(--r-lg)] border border-[var(--line)] p-3">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[var(--ink-2)]">
            <Warehouse className="h-4 w-4" /> Registrar armazenamento
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label>Local *</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex.: Almoxarifado EC — Prateleira 3" />
            </div>
            <div>
              <Label>Observação</Label>
              <Input value={storageNotes} onChange={(e) => setStorageNotes(e.target.value)} />
            </div>
          </div>
          <Button variant="outline" className="mt-3" onClick={() => storage.mutate()} disabled={storage.isPending || location.trim().length < 2}>
            Registrar local
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-[var(--bloqueado-ink)]">{error}</p>}

      {/* Histórico */}
      {(storageRecords.length > 0 || withdrawalRecords.length > 0) && (
        <div className="space-y-2 text-xs text-[var(--muted)]">
          {withdrawalRecords.map((w) => (
            <p key={w.id}>
              {w.completed ? "Retirado" : "Aguardando retirada"} por <strong>{w.withdrawnBy}</strong>{" "}
              em {formatDateTime(w.withdrawnAt)}
              {w.reason ? ` — ${w.reason}` : ""}
            </p>
          ))}
          {storageRecords.map((s) => (
            <p key={s.id}>
              Armazenado em <strong>{s.location}</strong> ({formatDateTime(s.storedAt)})
              {s.notes ? ` — ${s.notes}` : ""}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
