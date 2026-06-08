import type { RequestStatus } from "@/lib/enums";

export type StatusToken = {
  label: string;
  cls: string;
};

export const STATUS_TOKENS: Record<RequestStatus, StatusToken> = {
  RASCUNHO: { label: "Rascunho", cls: "rascunho" },
  AGUARDANDO_CADASTRO: { label: "Aguard. cadastro", cls: "aguard-cad" },
  AGUARDANDO_DOCUMENTOS: { label: "Aguard. docs", cls: "docs" },
  PENDENTE_DOCUMENTOS: { label: "Pendente docs", cls: "pendente" },
  AGUARDANDO_INSPECAO: { label: "Aguard. inspeção", cls: "inspecao" },
  LIBERADO: { label: "Liberado", cls: "liberado" },
  LIBERADO_COM_RESTRICAO: { label: "Liberado c/ restrição", cls: "restricao" },
  BLOQUEADO: { label: "Bloqueado", cls: "bloqueado" },
  EM_USO: { label: "Em uso", cls: "emuso" },
  AGUARDANDO_RETIRADA: { label: "Aguard. retirada", cls: "retirada" },
  RETIRADO: { label: "Retirado", cls: "retirado" },
  FLUXO_URGENCIA: { label: "Urgência", cls: "urgencia" },
};

export function statusSpineClass(status: RequestStatus) {
  const cls = STATUS_TOKENS[status]?.cls ?? "rascunho";
  return `gesteq-spine-${cls}`;
}

export function statusSpineBorderClass(status: RequestStatus) {
  const cls = STATUS_TOKENS[status]?.cls ?? "rascunho";
  return `gesteq-spine-border-${cls}`;
}

export function statusBadgeClass(status: RequestStatus) {
  const cls = STATUS_TOKENS[status]?.cls ?? "rascunho";
  return `gesteq-st-${cls}`;
}
