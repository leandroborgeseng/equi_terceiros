export type UserRole =
  | "ADMIN"
  | "ENGENHARIA_CLINICA"
  | "MEDICO"
  | "FORNECEDOR"
  | "CENTRO_CIRURGICO"
  | "CME_CCIH_NSP";

export type RequestStatus =
  | "RASCUNHO"
  | "AGUARDANDO_DOCUMENTACAO"
  | "DOCUMENTACAO_EM_ANALISE"
  | "PENDENTE_COMPLEMENTO"
  | "AGUARDANDO_INSPECAO"
  | "LIBERADO"
  | "LIBERADO_COM_RESTRICAO"
  | "BLOQUEADO"
  | "VENCIDO"
  | "ARQUIVADO"
  | "URGENCIA";

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
