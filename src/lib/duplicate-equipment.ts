/** Campos do formulário de novo equipamento (EC). */
export type NovoEquipamentoForm = {
  equipmentName: string;
  brand: string;
  model: string;
  serialNumber: string;
  equipmentClass: string;
  entryType: string;
  usageSector: string;
  supplierId: string;
  supplierName: string;
  ownerContact: string;
  ownerDocument: string;
  originPatrimony: string;
  storageLocation: string;
  boardAuthorization: string;
  observations: string;
  alreadyInPark: boolean;
  invoiceId: string;
};

export const NOVO_EQUIPAMENTO_DEFAULTS: NovoEquipamentoForm = {
  equipmentName: "",
  brand: "",
  model: "",
  serialNumber: "",
  equipmentClass: "B",
  entryType: "FORNECEDOR",
  usageSector: "",
  supplierId: "",
  supplierName: "",
  ownerContact: "",
  ownerDocument: "",
  originPatrimony: "",
  storageLocation: "",
  boardAuthorization: "",
  observations: "",
  alreadyInPark: false,
  invoiceId: "",
};

export type DuplicateSourceRequest = {
  protocol: string;
  internalOs?: string | null;
  equipmentName: string;
  brand: string;
  model: string;
  serialNumber: string;
  equipmentClass?: string | null;
  entryType: string;
  usageSector: string;
  supplierId?: string | null;
  supplierName: string;
  ownerContact: string;
  ownerDocument?: string | null;
  originPatrimony?: string | null;
  storageLocation?: string | null;
  boardAuthorization?: string | null;
  alreadyInPark?: boolean;
  invoiceId?: string | null;
  invoice?: { id: string; number?: string } | null;
};

export function buildDuplicateForm(source: DuplicateSourceRequest): {
  form: NovoEquipamentoForm;
  sourceLabel: string;
} {
  const sourceLabel = source.internalOs
    ? `${source.protocol} · OS ${source.internalOs}`
    : source.protocol;

  return {
    sourceLabel,
    form: {
      equipmentName: source.equipmentName,
      brand: source.brand,
      model: source.model,
      serialNumber: "",
      equipmentClass: source.equipmentClass ?? "B",
      entryType: source.entryType,
      usageSector: source.usageSector,
      supplierId: source.supplierId ?? "",
      supplierName: source.supplierName,
      ownerContact: source.ownerContact,
      ownerDocument: source.ownerDocument ?? "",
      originPatrimony: "",
      storageLocation: source.storageLocation ?? "",
      boardAuthorization: "",
      observations: "",
      alreadyInPark: !!source.alreadyInPark,
      invoiceId: source.invoiceId ?? source.invoice?.id ?? "",
    },
  };
}
