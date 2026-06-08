import type { RequestStatus } from "@/lib/enums";
import { DOC_CHECKLIST_ITEMS } from "@/lib/validators/request";
import { INSPECTION_ITEMS } from "@/lib/validators/request";

export const HOMOLOGATION_STAGES = [
  {
    key: "cadastro",
    label: "Cadastro",
    n: 1,
    hint: "Recebimento e dados",
    statuses: ["RASCUNHO", "AGUARDANDO_CADASTRO", "FLUXO_URGENCIA"] as RequestStatus[],
  },
  {
    key: "documentos",
    label: "Documentação",
    n: 2,
    hint: "Checklist Anexo II",
    statuses: ["AGUARDANDO_DOCUMENTOS", "PENDENTE_DOCUMENTOS"] as RequestStatus[],
  },
  {
    key: "inspecao",
    label: "Inspeção",
    n: 3,
    hint: "Técnica Anexo III",
    statuses: ["AGUARDANDO_INSPECAO"] as RequestStatus[],
  },
  {
    key: "liberacao",
    label: "Liberação",
    n: 4,
    hint: "Parecer e etiqueta",
    statuses: ["LIBERADO", "LIBERADO_COM_RESTRICAO", "BLOQUEADO", "EM_USO", "AGUARDANDO_RETIRADA"] as RequestStatus[],
  },
] as const;

export type StageKey = (typeof HOMOLOGATION_STAGES)[number]["key"];

export function stageForStatus(status: RequestStatus): StageKey {
  for (const stage of HOMOLOGATION_STAGES) {
    if ((stage.statuses as readonly string[]).includes(status)) return stage.key;
  }
  return "cadastro";
}

export const QUEUE_COUNTERS = [
  { id: "AGUARDANDO_DOCUMENTOS", label: "Aguard. docs", cls: "docs", statKey: "aguardandoDocumentos" },
  { id: "PENDENTE_DOCUMENTOS", label: "Pendentes", cls: "pendente", statKey: "pendenteDocumentos" },
  { id: "AGUARDANDO_INSPECAO", label: "Inspeção", cls: "inspecao", statKey: "aguardandoInspecao" },
  { id: "LIBERADO", label: "Liberados", cls: "liberado", statKey: "liberado" },
  { id: "BLOQUEADO", label: "Bloqueados", cls: "bloqueado", statKey: "bloqueado" },
  { id: "__urg", label: "Urgência", cls: "urgencia", statKey: "urgencia" },
  { id: "__venc", label: "Vencidos", cls: "bloqueado", statKey: "vencido" },
] as const;

export function countDocsOk(checklist: Record<string, unknown> | null | undefined): number {
  if (!checklist) return 0;
  return DOC_CHECKLIST_ITEMS.filter((item) => checklist[`${item.key}Status`] === "SIM").length;
}

export function countInspOk(inspection: Record<string, unknown> | null | undefined): number {
  if (!inspection) return 0;
  return INSPECTION_ITEMS.filter((item) => inspection[`${item.key}Status`] === "CONFORME").length;
}
