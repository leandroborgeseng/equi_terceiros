/** Dados de fornecedor usados para preencher o formulário de equipamento. */
export type SupplierOption = {
  id: string;
  name: string;
  cnpj?: string | null;
  email: string;
  phone?: string | null;
};

export function supplierFieldsFromOption(s: SupplierOption) {
  return {
    supplierId: s.id,
    supplierName: s.name,
    ownerDocument: s.cnpj ?? "",
    ownerContact: s.phone || s.email || "",
  };
}
