import { z } from "zod";

const dateField = z.union([z.date(), z.string()]).transform((v) => new Date(v));

export const medicalRequestSchema = z.object({
  requestDate: dateField,
  usageSector: z.string().min(2, "Setor obrigatório"),
  doctorCrm: z.string().min(4, "CRM obrigatório"),
  plannedProcedure: z.string().min(3, "Procedimento obrigatório"),
  plannedDate: dateField,
  plannedTime: z.string().min(4, "Horário obrigatório"),
  clinicalJustification: z.string().min(20, "Justificativa mínima 20 caracteres"),
  noInstitutionalAlternative: z.boolean(),
  technicalBenefit: z.string().min(10, "Ganho técnico-assistencial obrigatório"),
  equipmentName: z.string().min(2, "Equipamento obrigatório"),
  brand: z.string().min(1, "Marca obrigatória"),
  model: z.string().min(1, "Modelo obrigatório"),
  serialNumber: z.string().min(1, "Número de série obrigatório"),
  supplierName: z.string().min(2, "Fornecedor obrigatório"),
  ownerName: z.string().min(2, "Proprietário obrigatório"),
  ownerContact: z.string().min(5, "Contato obrigatório"),
  assistentialRisk: z.string().min(1, "Risco assistencial obrigatório"),
  isUrgent: z.boolean().optional(),
});

export const medicalRequestDraftSchema = medicalRequestSchema.partial();

/** Validação por etapa do wizard (não exige campos das etapas futuras) */
export const wizardStepSchemas = [
  medicalRequestSchema.pick({
    requestDate: true,
    usageSector: true,
    doctorCrm: true,
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
  supplierName: "",
  ownerName: "",
  ownerContact: "",
  assistentialRisk: "",
  isUrgent: false,
} as const;

export const checklistUpdateSchema = z.object({
  formFilled: z.enum(["APROVADO", "PENDENTE", "REPROVADO"]).optional(),
  supplierIdentified: z.enum(["APROVADO", "PENDENTE", "REPROVADO"]).optional(),
  anvisa: z.enum(["APROVADO", "PENDENTE", "REPROVADO"]).optional(),
  preventiveMaintenance: z.enum(["APROVADO", "PENDENTE", "REPROVADO"]).optional(),
  calibration: z.enum(["APROVADO", "PENDENTE", "REPROVADO"]).optional(),
  tse: z.enum(["APROVADO", "PENDENTE", "REPROVADO"]).optional(),
  manual: z.enum(["APROVADO", "PENDENTE", "REPROVADO"]).optional(),
  signedTerm: z.enum(["APROVADO", "PENDENTE", "REPROVADO"]).optional(),
  accessories: z.enum(["APROVADO", "PENDENTE", "REPROVADO"]).optional(),
  sanitization: z.enum(["APROVADO", "PENDENTE", "REPROVADO"]).optional(),
  insurance: z.enum(["APROVADO", "PENDENTE", "REPROVADO"]).optional(),
  rejectionReason: z.string().optional(),
});

export const inspectionSchema = z.object({
  status: z.enum(["PENDENTE", "LIBERADO", "LIBERADO_COM_RESTRICAO", "BLOQUEADO"]),
  physicalIntegrity: z.boolean().optional(),
  cabinet: z.boolean().optional(),
  cables: z.boolean().optional(),
  abntPlug: z.boolean().optional(),
  cleaning: z.boolean().optional(),
  accessories: z.boolean().optional(),
  selfDiagnostic: z.boolean().optional(),
  alarms: z.boolean().optional(),
  electricalCompatibility: z.boolean().optional(),
  gasCompatibility: z.boolean().optional(),
  infrastructureCompat: z.boolean().optional(),
  metrologicalEval: z.boolean().optional(),
  needsCalibration: z.boolean().optional(),
  needsTse: z.boolean().optional(),
  notes: z.string().optional(),
  restrictionNotes: z.string().optional(),
  blockReason: z.string().optional(),
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
