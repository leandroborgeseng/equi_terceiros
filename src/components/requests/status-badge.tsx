import { Badge } from "@/components/ui/badge";
import type { RequestStatus } from "@/lib/enums";

const config: Record<
  RequestStatus,
  { label: string; variant: "success" | "warning" | "danger" | "orange" | "info" | "default" }
> = {
  RASCUNHO: { label: "Rascunho", variant: "default" },
  AGUARDANDO_DOCUMENTACAO: { label: "Aguardando documentação", variant: "warning" },
  DOCUMENTACAO_EM_ANALISE: { label: "Em análise", variant: "info" },
  PENDENTE_COMPLEMENTO: { label: "Pendente complemento", variant: "warning" },
  AGUARDANDO_INSPECAO: { label: "Aguardando inspeção", variant: "info" },
  LIBERADO: { label: "Liberado", variant: "success" },
  LIBERADO_COM_RESTRICAO: { label: "Liberado c/ restrição", variant: "orange" },
  BLOQUEADO: { label: "Bloqueado", variant: "danger" },
  VENCIDO: { label: "Vencido", variant: "danger" },
  ARQUIVADO: { label: "Arquivado", variant: "default" },
  URGENCIA: { label: "Urgência", variant: "danger" },
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const c = config[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
