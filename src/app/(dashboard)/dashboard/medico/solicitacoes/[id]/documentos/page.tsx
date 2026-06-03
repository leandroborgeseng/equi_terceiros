"use client";

import { useParams } from "next/navigation";
import { MobileUpload, OfflineSyncBanner } from "@/components/upload/mobile-upload";
import { PHOTO_LABELS, REQUIRED_PHOTOS, REQUIRED_DOCUMENT_TYPES } from "@/lib/validators/request";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";

const DOC_TYPES = [
  { type: "ANVISA", label: "Registro ANVISA", required: true },
  { type: "MANUAL", label: "Manual do equipamento", required: true },
  { type: "MANUTENCAO_PREVENTIVA", label: "Manutenção preventiva", required: true },
  { type: "CALIBRACAO", label: "Calibração", required: true },
  { type: "TESTE_SEGURANCA_ELETRICA", label: "TSE", required: true },
  { type: "TERMO_RESPONSABILIDADE", label: "Termo de responsabilidade", required: false },
  { type: "APOLICE_SEGURO", label: "Apólice de seguro", required: false },
] as const;

const requiredSet = new Set<string>(REQUIRED_DOCUMENT_TYPES);

export default function DocumentosPage() {
  const { id } = useParams<{ id: string }>();

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro");
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Documentação e fotos</h1>
        <p className="text-sm text-slate-500">Todas as fotos obrigatórias são necessárias para envio</p>
      </div>

      <OfflineSyncBanner />

      <section className="space-y-4">
        <h2 className="font-semibold text-slate-800">Fotos obrigatórias</h2>
        {REQUIRED_PHOTOS.map((photoType) => (
          <MobileUpload
            key={photoType}
            requestId={id}
            type="FOTO_EQUIPAMENTO"
            photoType={photoType}
            label={PHOTO_LABELS[photoType]}
          />
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-slate-800">Documentos</h2>
        {DOC_TYPES.map((doc) => (
          <div key={doc.type}>
            <MobileUpload requestId={id} type={doc.type} label={doc.label} />
            {requiredSet.has(doc.type) && (
              <p className="mt-1 text-xs text-red-600">Obrigatório para envio</p>
            )}
          </div>
        ))}
      </section>

      <Button
        className="w-full"
        size="lg"
        onClick={() => submitMutation.mutate()}
        disabled={submitMutation.isPending}
      >
        {submitMutation.isPending ? "Enviando..." : "Enviar para homologação"}
      </Button>
      {submitMutation.error && (
        <p className="text-sm text-red-600">{(submitMutation.error as Error).message}</p>
      )}
    </div>
  );
}
