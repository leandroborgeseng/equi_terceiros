"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MobileUpload, OfflineSyncBanner } from "@/components/upload/mobile-upload";
import { PHOTO_LABELS, REQUIRED_PHOTOS } from "@/lib/validators/request";
import { formatDate } from "@/lib/utils";
import { GestEqLogo } from "@/components/gesteq/logo";
import { Panel } from "@/components/gesteq/panel";

export default function FornecedorPublicPage() {
  const { token } = useParams<{ token: string }>();

  const { data, isError } = useQuery({
    queryKey: ["supplier", token],
    queryFn: () => fetch(`/api/public/supplier/${token}`).then((r) => {
      if (!r.ok) throw new Error("Link inválido");
      return r.json();
    }),
  });

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] p-4">
        <p className="text-[var(--bloqueado-ink)]">Link inválido ou expirado.</p>
      </div>
    );
  }

  if (!data) return <p className="p-8 text-center text-[var(--muted)]">Carregando...</p>;

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <header className="border-b border-[var(--line)] bg-[var(--card)] px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <GestEqLogo size={36} />
          <p className="gesteq-eyebrow">Portal do Fornecedor</p>
        </div>
        <div className="mx-auto mt-3 max-w-lg">
          <h1 className="font-display text-lg font-semibold text-[var(--ink)]">{data.protocol}</h1>
          <p className="text-sm text-[var(--ink-2)]">
            {data.equipmentName} — {data.brand} {data.model}
          </p>
        </div>
      </header>

      <main className="gesteq-rise mx-auto max-w-lg space-y-6 p-4 pb-24">
        <Panel title="Dados da solicitação">
          <div className="text-sm text-[var(--ink-2)] space-y-1">
            <p>
              Solicitante: {data.doctor?.name ?? data.requesterName ?? "—"}
              {(data.doctor?.crm ?? data.doctorCrm) ? ` — CRM ${data.doctor?.crm ?? data.doctorCrm}` : ""}
            </p>
            <p>Procedimento: {data.plannedProcedure}</p>
            <p>Data: {formatDate(data.plannedDate)}</p>
            <p>Status: {data.status}</p>
          </div>
        </Panel>

        <OfflineSyncBanner />

        <section className="space-y-4">
          <h2 className="font-display font-semibold text-[var(--ink)]">Fotos obrigatórias</h2>
          {REQUIRED_PHOTOS.map((photoType) => (
            <MobileUpload
              key={photoType}
              requestId={data.id}
              type="FOTO_EQUIPAMENTO"
              photoType={photoType}
              label={PHOTO_LABELS[photoType]}
            />
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-semibold text-[var(--ink)]">Documentos ANVISA e certificados</h2>
          {["ANVISA", "MANUTENCAO_PREVENTIVA", "CALIBRACAO", "TESTE_SEGURANCA_ELETRICA", "APOLICE_SEGURO"].map((type) => (
            <MobileUpload key={type} requestId={data.id} type={type} label={type.replace(/_/g, " ")} />
          ))}
        </section>
      </main>
    </div>
  );
}
