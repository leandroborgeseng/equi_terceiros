"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/gesteq/page-header";
import { Panel } from "@/components/gesteq/panel";

export default function FornecedorDashboardPage() {
  return (
    <div className="gesteq-rise mx-auto max-w-lg space-y-6">
      <PageHeader
        eyebrow="Fornecedor"
        title="Portal do Fornecedor"
        subtitle="Envio de documentação via link exclusivo"
      />

      <Panel title="Como funciona">
        <div className="space-y-3 text-sm text-[var(--ink-2)]">
          <p>O fornecedor recebe um link exclusivo gerado na solicitação médica ou pela Engenharia Clínica.</p>
          <p className="flex items-center gap-2 text-[var(--muted)]">
            <ExternalLink className="h-4 w-4 shrink-0" />
            Formato: <span className="font-mono-data">/fornecedor/[token]</span>
          </p>
          <p className="rounded-[var(--r-md)] bg-[var(--surface-2)] p-3 font-mono-data text-xs text-[var(--ink-2)]">
            Demo: /fornecedor/demotoken123456
          </p>
        </div>
      </Panel>

      <Card>
        <CardContent className="py-4 text-sm text-[var(--muted)]">
          Fotos obrigatórias, documentos ANVISA e certificados são enviados pelo celular, com suporte
          offline e sincronização automática.
        </CardContent>
      </Card>
    </div>
  );
}
