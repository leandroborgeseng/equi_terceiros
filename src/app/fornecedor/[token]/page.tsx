"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MobileUpload, OfflineSyncBanner } from "@/components/upload/mobile-upload";
import { PHOTO_LABELS, REQUIRED_PHOTOS } from "@/lib/validators/request";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

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
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-red-600">Link inválido ou expirado.</p>
      </div>
    );
  }

  if (!data) return <p className="p-8 text-center">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white px-4 py-4">
        <p className="text-xs text-slate-500">Portal do Fornecedor</p>
        <h1 className="font-bold text-slate-900">{data.protocol}</h1>
        <p className="text-sm text-slate-600">{data.equipmentName} — {data.brand} {data.model}</p>
      </header>

      <main className="mx-auto max-w-lg space-y-6 p-4 pb-24">
        <Card>
          <CardHeader><CardTitle>Dados da solicitação</CardTitle></CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-1">
            <p>
              Solicitante: {data.doctor?.name ?? data.requesterName ?? "—"}
              {(data.doctor?.crm ?? data.doctorCrm) ? ` — CRM ${data.doctor?.crm ?? data.doctorCrm}` : ""}
            </p>
            <p>Procedimento: {data.plannedProcedure}</p>
            <p>Data: {formatDate(data.plannedDate)}</p>
            <p>Status: {data.status}</p>
          </CardContent>
        </Card>

        <OfflineSyncBanner />

        <section className="space-y-4">
          <h2 className="font-semibold">Fotos obrigatórias</h2>
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
          <h2 className="font-semibold">Documentos ANVISA e certificados</h2>
          {["ANVISA", "MANUTENCAO_PREVENTIVA", "CALIBRACAO", "TESTE_SEGURANCA_ELETRICA", "APOLICE_SEGURO"].map((type) => (
            <MobileUpload key={type} requestId={data.id} type={type} label={type.replace(/_/g, " ")} />
          ))}
        </section>
      </main>
    </div>
  );
}
