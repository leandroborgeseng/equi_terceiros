"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestStatusBadge } from "@/components/requests/status-badge";
import type { RequestStatus } from "@/lib/enums";
import { EQUIPMENT_CLASS_LABELS } from "@/lib/enums";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";
import { GestEqLogo } from "@/components/gesteq/logo";

type EquipmentInfo = {
  protocol: string;
  internalOs?: string | null;
  status: RequestStatus;
  equipmentClass?: string | null;
  equipmentName: string;
  brand: string;
  model: string;
  serialNumber: string;
  entryType: string;
  usageSector: string;
  destinationSector?: string | null;
  supplierName: string;
  ownerName: string;
  invoiceNumber?: string | null;
  entryDate?: string | null;
  plannedDate?: string | null;
  validUntil?: string | null;
  restrictionNotes?: string | null;
  blockReason?: string | null;
  technicalLead?: string | null;
  inspectedAt?: string | null;
};

export default function EquipamentoPublicPage() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, isError } = useQuery<EquipmentInfo>({
    queryKey: ["equipamento-public", token],
    queryFn: () =>
      fetch(`/api/public/equipment/${token}`).then((r) => {
        if (!r.ok) throw new Error("Equipamento não encontrado");
        return r.json();
      }),
    retry: false,
  });

  const liberado = data?.status === "LIBERADO";
  const restrito = data?.status === "LIBERADO_COM_RESTRICAO";
  const bloqueado = data?.status === "BLOQUEADO";

  const statusBg = liberado
    ? "var(--liberado)"
    : restrito
      ? "var(--restricao)"
      : bloqueado
        ? "var(--bloqueado)"
        : "var(--muted)";

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <header className="border-b border-[var(--line)] bg-[var(--card)] px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <GestEqLogo size={36} />
          <p className="gesteq-eyebrow text-right">Consulta pública · Norma 445.000</p>
        </div>
      </header>

      <main className="gesteq-rise mx-auto max-w-lg space-y-4 p-4 pb-24">
        {isLoading && <p className="p-8 text-center text-[var(--muted)]">Carregando...</p>}

        {isError && (
          <div className="rounded-[var(--r-lg)] bg-[var(--bloqueado-soft)] px-4 py-6 text-center text-[var(--bloqueado-ink)]">
            QR Code inválido ou equipamento não encontrado.
          </div>
        )}

        {data && (
          <>
            {/* Faixa de status grande para leitura rápida no setor */}
            <div
              className="flex items-center gap-3 rounded-[var(--r-xl)] p-4 text-white"
              style={{ background: statusBg }}
            >
              {liberado && <CheckCircle2 className="h-8 w-8 shrink-0" />}
              {restrito && <AlertTriangle className="h-8 w-8 shrink-0" />}
              {bloqueado && <XCircle className="h-8 w-8 shrink-0" />}
              {!liberado && !restrito && !bloqueado && <ShieldCheck className="h-8 w-8 shrink-0" />}
              <div>
                <p className="text-lg font-bold leading-tight">
                  {liberado
                    ? "Liberado para uso"
                    : restrito
                      ? "Liberado com restrição"
                      : bloqueado
                        ? "Bloqueado / Interditado"
                        : "Em homologação"}
                </p>
                <p className="text-sm opacity-90">{data.equipmentName}</p>
              </div>
            </div>

            {(data.restrictionNotes || data.blockReason) && (
              <div className="rounded-[var(--r-lg)] bg-[var(--restricao-soft)] px-4 py-3 text-sm text-[var(--restricao-ink)]">
                <strong>{bloqueado ? "Motivo do bloqueio:" : "Restrição:"}</strong>{" "}
                {data.blockReason || data.restrictionNotes}
              </div>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Dados do equipamento</CardTitle>
                  <RequestStatusBadge status={data.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[var(--ink-2)]">
                <Row label="Equipamento" value={`${data.equipmentName}`} />
                <Row label="Marca / Modelo" value={`${data.brand} ${data.model}`} />
                <Row label="Nº de série" value={data.serialNumber || "—"} />
                <Row label="OS interna" value={data.internalOs ?? data.protocol} />
                <Row
                  label="Classe"
                  value={
                    data.equipmentClass
                      ? EQUIPMENT_CLASS_LABELS[data.equipmentClass as keyof typeof EQUIPMENT_CLASS_LABELS] ??
                        data.equipmentClass
                      : "—"
                  }
                />
                <Row label="Setor" value={data.destinationSector || data.usageSector} />
                <Row label="Tipo de ingresso" value={data.entryType} />
                <Row label="Fornecedor" value={data.supplierName || "—"} />
                {data.invoiceNumber && <Row label="Nota fiscal" value={`NF ${data.invoiceNumber}`} />}
                {data.entryDate && <Row label="Entrada" value={formatDate(data.entryDate)} />}
                {data.validUntil && <Row label="Validade" value={formatDate(data.validUntil)} />}
                {data.technicalLead && <Row label="Responsável técnico" value={data.technicalLead} />}
                {data.inspectedAt && <Row label="Inspecionado em" value={formatDate(data.inspectedAt)} />}
              </CardContent>
            </Card>

            <p className="text-center text-xs text-[var(--muted)]">
              Consulta pública de status. Para edição, acesse a plataforma.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-[var(--line-2)] py-1.5 last:border-0">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="text-right font-medium text-[var(--ink)]">{value}</span>
    </div>
  );
}
