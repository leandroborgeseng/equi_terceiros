import { Badge } from "@/components/ui/badge";
import type { RequestStatus } from "@/lib/enums";

type Variant =
  | "success"
  | "warning"
  | "danger"
  | "orange"
  | "info"
  | "default"
  | "purple"
  | "successDark"
  | "grayDark";

const config: Record<RequestStatus, { label: string; variant: Variant }> = {
  RASCUNHO: { label: "Rascunho", variant: "default" },
  AGUARDANDO_CADASTRO: { label: "Aguardando cadastro", variant: "default" },
  AGUARDANDO_DOCUMENTOS: { label: "Aguardando documentos", variant: "warning" },
  PENDENTE_DOCUMENTOS: { label: "Pendente documentos", variant: "orange" },
  AGUARDANDO_INSPECAO: { label: "Aguardando inspeção", variant: "info" },
  LIBERADO: { label: "Liberado", variant: "success" },
  LIBERADO_COM_RESTRICAO: { label: "Liberado c/ restrição", variant: "orange" },
  BLOQUEADO: { label: "Bloqueado", variant: "danger" },
  EM_USO: { label: "Em uso", variant: "successDark" },
  AGUARDANDO_RETIRADA: { label: "Aguardando retirada", variant: "orange" },
  RETIRADO: { label: "Retirado", variant: "grayDark" },
  FLUXO_URGENCIA: { label: "Fluxo de urgência", variant: "purple" },
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const c = config[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
