import { z } from "zod";

const dateField = z.union([z.date(), z.string()]).transform((v) => new Date(v));

export const medicalRequestSchema = z.object({
  requestDate: dateField,
  usageSector: z.string().min(2, "Setor obrigatório"),
  doctorCrm: z.string().min(4, "CRM obrigatório"),
  patientName: z.string().min(2, "Paciente obrigatório"),
  medicalRecord: z.string().min(1, "Prontuário obrigatório"),
  plannedProcedure: z.string().min(3, "Procedimento obrigatório"),
  plannedDate: dateField,
  plannedTime: z.string().min(4, "Horário obrigatório"),
  clinicalJustification: z.string().min(20, "Justificativa mínima 20 caracteres"),
  noInstitutionalAlternative: z.boolean(),
  technicalBenefit: z.string().min(10, "Ganho técnico-assistencial obrigatório"),
  equipmentName: z.string().min(2, "Equipamento obrigatório"),
  brand: z.string().min(1, "Marca obrigatória"),
  model: z.string().min(1, "Modelo obrigatório"),
  serialNumber: z.string().optional(),
  entryType: z
    .enum(["MEDICO", "FORNECEDOR", "COMODATO", "ALUGUEL", "DEMONSTRACAO", "OUTRO"])
    .default("MEDICO"),
  supplierName: z.string().min(2, "Fornecedor obrigatório"),
  ownerName: z.string().min(2, "Proprietário obrigatório"),
  ownerContact: z.string().min(5, "Contato obrigatório"),
  ownerDocument: z.string().optional(),
  assistentialRisk: z.string().min(1, "Risco assistencial obrigatório"),
  isUrgent: z.boolean().optional(),
  equipmentClass: z.enum(["A", "B", "C", "D"]).optional(),
  expectedExitDate: dateField.optional(),
});

export const medicalRequestDraftSchema = medicalRequestSchema.partial();

// Solicitação pública (sem login) — médico OU empresa preenchem o Anexo I.
// Identificação completa do solicitante para rastreabilidade.
export const publicRequestSchema = z.object({
  requesterName: z.string().min(3, "Nome do solicitante obrigatório"),
  requesterEmail: z.string().email("E-mail inválido"),
  requesterPhone: z.string().min(8, "Telefone obrigatório"),
  doctorCrm: z.string().optional(),
  usageSector: z.string().min(2, "Setor obrigatório"),
  patientName: z.string().optional(),
  medicalRecord: z.string().optional(),
  plannedProcedure: z.string().min(3, "Procedimento obrigatório"),
  plannedDate: dateField,
  plannedTime: z.string().min(4, "Horário obrigatório"),
  clinicalJustification: z.string().min(20, "Justificativa mínima 20 caracteres"),
  noInstitutionalAlternative: z.boolean().optional(),
  technicalBenefit: z.string().optional(),
  equipmentName: z.string().min(2, "Equipamento obrigatório"),
  brand: z.string().min(1, "Marca obrigatória"),
  model: z.string().min(1, "Modelo obrigatório"),
  serialNumber: z.string().optional(),
  entryType: z
    .enum(["MEDICO", "FORNECEDOR", "COMODATO", "ALUGUEL", "DEMONSTRACAO", "OUTRO"])
    .default("MEDICO"),
  supplierName: z.string().min(2, "Fornecedor/empresa obrigatório"),
  ownerName: z.string().min(2, "Proprietário obrigatório"),
  ownerContact: z.string().min(5, "Contato do proprietário obrigatório"),
  ownerDocument: z.string().optional(),
  assistentialRisk: z.string().optional(),
  isUrgent: z.boolean().optional(),
});

export type PublicRequestInput = z.input<typeof publicRequestSchema>;

// Cadastro de fornecedor (EC/Admin)
export const supplierSchema = z.object({
  name: z.string().min(2, "Nome do fornecedor obrigatório"),
  cnpj: z.string().optional(),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type SupplierInput = z.input<typeof supplierSchema>;

// Nota Fiscal (compartilhada por um grupo de equipamentos)
export const invoiceSchema = z.object({
  number: z.string().min(1, "Número da NF obrigatório"),
  issueDate: dateField.optional(),
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  totalValue: z.coerce.number().optional(),
  notes: z.string().optional(),
});

export const invoiceUpdateSchema = z.object({
  issueDate: dateField.optional(),
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  totalValue: z.coerce.number().optional(),
  notes: z.string().optional(),
  fileKey: z.string().optional(),
  fileName: z.string().optional(),
});

export type InvoiceInput = z.input<typeof invoiceSchema>;

// Cadastro de equipamento originado pela Engenharia Clínica (entrada nova OU formalização de parque)
export const ecEquipmentRequestSchema = z.object({
  equipmentName: z.string().min(2, "Equipamento obrigatório"),
  brand: z.string().min(1, "Marca obrigatória"),
  model: z.string().min(1, "Modelo obrigatório"),
  serialNumber: z.string().min(1, "Número de série obrigatório"),
  equipmentClass: z.enum(["A", "B", "C", "D"]),
  entryType: z
    .enum(["MEDICO", "FORNECEDOR", "COMODATO", "ALUGUEL", "DEMONSTRACAO", "OUTRO"])
    .default("FORNECEDOR"),
  usageSector: z.string().min(2, "Setor obrigatório"),
  supplierId: z.string().optional(),
  supplierName: z.string().min(2, "Fornecedor obrigatório"),
  ownerName: z.string().min(2, "Proprietário obrigatório"),
  ownerContact: z.string().min(5, "Contato do proprietário obrigatório"),
  ownerDocument: z.string().optional(),
  originPatrimony: z.string().optional(),
  clinicalJustification: z.string().optional(),
  plannedProcedure: z.string().optional(),
  expectedExitDate: dateField.optional(),
  storageLocation: z.string().optional(),
  boardAuthorization: z.string().optional(),
  observations: z.string().optional(),
  alreadyInPark: z.boolean().optional(),
  // Nota fiscal: vincular existente OU criar por número
  invoiceId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoiceDate: dateField.optional(),
});

export type EcEquipmentRequestInput = z.input<typeof ecEquipmentRequestSchema>;

// Status considerados "não validados" — passíveis de exclusão pela EC/Admin
export const DELETABLE_STATUSES = [
  "RASCUNHO",
  "AGUARDANDO_CADASTRO",
  "AGUARDANDO_DOCUMENTOS",
  "PENDENTE_DOCUMENTOS",
  "AGUARDANDO_INSPECAO",
] as const;

export const wizardStepSchemas = [
  medicalRequestSchema.pick({
    requestDate: true,
    usageSector: true,
    doctorCrm: true,
    patientName: true,
    medicalRecord: true,
  }),
  medicalRequestSchema.pick({
    plannedProcedure: true,
    plannedDate: true,
    plannedTime: true,
    clinicalJustification: true,
  }),
  medicalRequestSchema.pick({
    noInstitutionalAlternative: true,
    technicalBenefit: true,
    assistentialRisk: true,
    isUrgent: true,
  }),
  medicalRequestSchema.pick({
    equipmentName: true,
    brand: true,
    model: true,
    serialNumber: true,
    entryType: true,
  }),
  medicalRequestSchema.pick({
    supplierName: true,
    ownerName: true,
    ownerContact: true,
  }),
] as const;

export const REQUEST_DRAFT_DEFAULTS = {
  requestDate: new Date(),
  usageSector: "",
  doctorCrm: "",
  patientName: "",
  medicalRecord: "",
  plannedProcedure: "",
  plannedDate: new Date(),
  plannedTime: "08:00",
  clinicalJustification: "",
  noInstitutionalAlternative: true,
  technicalBenefit: "",
  equipmentName: "",
  brand: "",
  model: "",
  serialNumber: "",
  entryType: "MEDICO",
  supplierName: "",
  ownerName: "",
  ownerContact: "",
  assistentialRisk: "",
  isUrgent: false,
} as const;

/** Documentos exigidos antes do envio à EC (além das 8 fotos) */
export const REQUIRED_DOCUMENT_TYPES = [
  "ANVISA",
  "MANUAL",
  "MANUTENCAO_PREVENTIVA",
  "CALIBRACAO",
  "TESTE_SEGURANCA_ELETRICA",
] as const;

// Cadastro Engenharia Clínica (recebimento do equipamento)
export const equipmentRegistrationSchema = z.object({
  serialNumber: z.string().min(1, "Número de série obrigatório"),
  originPatrimony: z.string().optional(),
  equipmentClass: z.enum(["A", "B", "C", "D"]),
  destinationSector: z.string().min(2, "Setor de destino obrigatório"),
  entryDate: dateField,
  expectedExitDate: dateField.optional(),
  storageLocation: z.string().optional(),
  boardAuthorization: z.string().optional(),
  observations: z.string().optional(),
});

// Anexo II — checklist documental (8 itens). docType = categoria do anexo comprobatório.
export const DOC_CHECKLIST_ITEMS = [
  { key: "item1", label: "Formulário de Solicitação/Justificativa de Uso (Anexo I)", docType: "OUTROS" },
  { key: "item2", label: "Identificação do proprietário/fornecedor (CNPJ/CPF)", docType: "OUTROS" },
  { key: "item3", label: "Comprovante de regularização na ANVISA", docType: "ANVISA" },
  { key: "item4", label: "Certificado de Manutenção Preventiva vigente", docType: "MANUTENCAO_PREVENTIVA" },
  { key: "item5", label: "Certificado de Calibração vigente (se aplicável)", docType: "CALIBRACAO" },
  { key: "item6", label: "Laudo de Teste de Segurança Elétrica (se aplicável)", docType: "TESTE_SEGURANCA_ELETRICA" },
  { key: "item7", label: "Manual de Instruções em Português", docType: "MANUAL" },
  { key: "item8", label: "Termo de Responsabilidade assinado (Anexo IV)", docType: "TERMO_RESPONSABILIDADE" },
] as const;

const docItemStatus = z.enum(["SIM", "NAO", "NA"]).optional();
const optStr = z.string().optional();

export const checklistUpdateSchema = z.object({
  item1Status: docItemStatus,
  item1Obs: optStr,
  item1FileKey: optStr,
  item2Status: docItemStatus,
  item2Obs: optStr,
  item2FileKey: optStr,
  item3Status: docItemStatus,
  item3Obs: optStr,
  item3FileKey: optStr,
  item4Status: docItemStatus,
  item4Obs: optStr,
  item4FileKey: optStr,
  item5Status: docItemStatus,
  item5Obs: optStr,
  item5FileKey: optStr,
  item6Status: docItemStatus,
  item6Obs: optStr,
  item6FileKey: optStr,
  item7Status: docItemStatus,
  item7Obs: optStr,
  item7FileKey: optStr,
  item8Status: docItemStatus,
  item8Obs: optStr,
  item8FileKey: optStr,
  docStatus: z.enum(["APROVADO", "PENDENTE", "REPROVADO"]).optional(),
  rejectionReason: z.string().optional(),
});

// Anexo III — inspeção técnica (7 itens)
export const INSPECTION_ITEMS = [
  { key: "item1", label: "Integridade do chassi/gabinete (sem trincas/quebras)" },
  { key: "item2", label: "Cabo de alimentação e plugue (padrão ABNT)" },
  { key: "item3", label: "Acessórios, cabos de paciente e periféricos" },
  { key: "item4", label: "Condições de limpeza externa aparente" },
  { key: "item5", label: "Teste de autodiagnóstico (POST) OK" },
  { key: "item6", label: "Alarmes visuais e sonoros operantes" },
  { key: "item7", label: "Compatibilidade com rede elétrica/gases" },
] as const;

const inspectionItemStatus = z.enum(["CONFORME", "NAO_CONFORME", "NA"]).optional();

export const inspectionSchema = z.object({
  item1Status: inspectionItemStatus,
  item2Status: inspectionItemStatus,
  item3Status: inspectionItemStatus,
  item4Status: inspectionItemStatus,
  item5Status: inspectionItemStatus,
  item6Status: inspectionItemStatus,
  item7Status: inspectionItemStatus,
  electricalSafetyTest: z.enum(["SIM", "NAO", "NA"]).optional(),
  electricalSafetyResult: z.string().optional(),
  cmeRequired: z.boolean().optional(),
  generalNotes: z.string().optional(),
  status: z.enum(["PENDENTE", "LIBERADO", "LIBERADO_COM_RESTRICAO", "BLOQUEADO"]),
  restrictionNotes: z.string().optional(),
  blockReason: z.string().optional(),
  signatureData: z.string().optional(),
});

export const REQUIRED_PHOTOS = [
  "FRONTAL",
  "TRASEIRA",
  "ETIQUETA_FABRICANTE",
  "NUMERO_SERIE",
  "ACESSORIOS",
  "CABOS",
  "PLUGUE",
  "MONTADO",
] as const;

export const PHOTO_LABELS: Record<(typeof REQUIRED_PHOTOS)[number], string> = {
  FRONTAL: "Foto frontal",
  TRASEIRA: "Foto traseira",
  ETIQUETA_FABRICANTE: "Etiqueta do fabricante",
  NUMERO_SERIE: "Número de série",
  ACESSORIOS: "Acessórios",
  CABOS: "Cabos",
  PLUGUE: "Plugue",
  MONTADO: "Equipamento montado",
};
