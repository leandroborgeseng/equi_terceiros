export type UserRole =
  | "ADMIN"
  | "ENGENHARIA_CLINICA"
  | "MEDICO"
  | "FORNECEDOR"
  | "CENTRO_CIRURGICO"
  | "CME_CCIH_NSP";

// GestEq — Norma 445.000 (status do equipamento)
export type RequestStatus =
  | "RASCUNHO"
  | "AGUARDANDO_CADASTRO"
  | "AGUARDANDO_DOCUMENTOS"
  | "PENDENTE_DOCUMENTOS"
  | "AGUARDANDO_INSPECAO"
  | "LIBERADO"
  | "LIBERADO_COM_RESTRICAO"
  | "BLOQUEADO"
  | "EM_USO"
  | "AGUARDANDO_RETIRADA"
  | "RETIRADO"
  | "FLUXO_URGENCIA";

export type EquipmentClass = "A" | "B" | "C" | "D";

export const EQUIPMENT_CLASS_LABELS: Record<EquipmentClass, string> = {
  A: "A — Permanência contínua (> 30 dias)",
  B: "B — Temporário programado",
  C: "C — Esporádico (entra e sai no dia)",
  D: "D — Urgência / Emergência",
};

export type EntryType =
  | "MEDICO"
  | "FORNECEDOR"
  | "COMODATO"
  | "ALUGUEL"
  | "DEMONSTRACAO"
  | "OUTRO";

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  MEDICO: "Médico",
  FORNECEDOR: "Fornecedor",
  COMODATO: "Comodato",
  ALUGUEL: "Aluguel",
  DEMONSTRACAO: "Demonstração",
  OUTRO: "Outro",
};

export type FlowType = "ELETIVO" | "URGENCIA";

// Itens de checklist documental (Anexo II): SIM | NAO | NA
export type DocItemStatus = "SIM" | "NAO" | "NA";
// Itens de inspeção técnica (Anexo III): CONFORME | NAO_CONFORME | NA
export type InspectionItemStatus = "CONFORME" | "NAO_CONFORME" | "NA";
export type ChecklistItemStatus = "APROVADO" | "PENDENTE" | "REPROVADO";
export type DocumentType =
  | "ANVISA"
  | "MANUAL"
  | "MANUTENCAO_PREVENTIVA"
  | "CALIBRACAO"
  | "TESTE_SEGURANCA_ELETRICA"
  | "TERMO_RESPONSABILIDADE"
  | "FOTO_EQUIPAMENTO"
  | "FOTO_SERIE"
  | "FOTO_ACESSORIOS"
  | "FOTO_PLUGUE"
  | "FOTO_INSTALACAO"
  | "APOLICE_SEGURO"
  | "OUTROS";

export type RequiredPhotoType =
  | "FRONTAL"
  | "TRASEIRA"
  | "ETIQUETA_FABRICANTE"
  | "NUMERO_SERIE"
  | "ACESSORIOS"
  | "CABOS"
  | "PLUGUE"
  | "MONTADO";

export type InspectionStatus =
  | "PENDENTE"
  | "LIBERADO"
  | "LIBERADO_COM_RESTRICAO"
  | "BLOQUEADO";

export const INSPECTION_RELEASE_STATUSES = [
  "PENDENTE",
  "LIBERADO",
  "LIBERADO_COM_RESTRICAO",
  "BLOQUEADO",
] as const;

export type ReleaseLabelStatus =
  | "PENDENTE_ANALISE"
  | "LIBERADO"
  | "LIBERADO_COM_RESTRICAO"
  | "BLOQUEADO";

export type AlertType =
  | "MANUTENCAO_PREVENTIVA"
  | "CALIBRACAO"
  | "TSE"
  | "DOCUMENTACAO"
  | "RETIRADA_PENDENTE"
  | "REGULARIZACAO_URGENCIA"
  | "PRAZO_72H";

export type AlertSeverity =
  | "INFO_30_DIAS"
  | "WARN_15_DIAS"
  | "URGENT_7_DIAS"
  | "VENCIMENTO"
  | "VENCIDO";

export type AiValidationStatus =
  | "PENDING"
  | "PROCESSING"
  | "VALIDATED"
  | "FAILED"
  | "MANUAL_REVIEW";
