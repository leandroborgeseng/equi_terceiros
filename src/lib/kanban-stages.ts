import type { RequestStatus } from "@/lib/enums";
import type { StageKey } from "@/lib/queue-stages";

const LIBERATION_STATUSES: RequestStatus[] = [
  "LIBERADO",
  "LIBERADO_COM_RESTRICAO",
  "BLOQUEADO",
  "EM_USO",
  "AGUARDANDO_RETIRADA",
];

/** Status representativo ao soltar um card em cada coluna do quadro */
export const STAGE_DROP_STATUS: Record<StageKey, RequestStatus> = {
  cadastro: "AGUARDANDO_CADASTRO",
  documentos: "AGUARDANDO_DOCUMENTOS",
  inspecao: "AGUARDANDO_INSPECAO",
  liberacao: "LIBERADO",
};

export function resolveStageDrop(
  stage: StageKey,
  current: RequestStatus
): { status: RequestStatus } | { error: string } {
  if (stage === "liberacao") {
    if (LIBERATION_STATUSES.includes(current)) {
      return { status: current };
    }
    return {
      error:
        "Liberação exige inspeção técnica concluída. Conclua na aba Inspeção do equipamento.",
    };
  }

  const target = STAGE_DROP_STATUS[stage];
  if (current === target) {
    return { status: current };
  }

  return { status: target };
}
