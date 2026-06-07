export type DoctorFilterRow = {
  doctor?: { id: string; name: string } | null;
  requesterName?: string | null;
};

export type SupplierFilterRow = {
  supplier?: { id: string; name: string } | null;
  supplierName?: string;
};

export function parseEntityFilterKey(key: string) {
  const sep = key.indexOf(":");
  if (sep <= 0) return null;
  return { kind: key.slice(0, sep), value: key.slice(sep + 1) };
}

export function buildDoctorOptions(rows: DoctorFilterRow[]) {
  const map = new Map<string, string>();
  for (const r of rows) {
    if (r.doctor?.id) map.set(`id:${r.doctor.id}`, r.doctor.name);
    else if (r.requesterName?.trim()) {
      const name = r.requesterName.trim();
      map.set(`name:${name}`, name);
    }
  }
  return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
}

export function buildSupplierOptions(rows: SupplierFilterRow[]) {
  const map = new Map<string, string>();
  for (const r of rows) {
    if (r.supplier?.id) map.set(`id:${r.supplier.id}`, r.supplier.name);
    else if (r.supplierName?.trim()) {
      const name = r.supplierName.trim();
      map.set(`name:${name}`, name);
    }
  }
  return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
}

export function matchesDoctorFilter(row: DoctorFilterRow, filterKey: string) {
  const parsed = parseEntityFilterKey(filterKey);
  if (!parsed) return true;
  if (parsed.kind === "id") return row.doctor?.id === parsed.value;
  if (parsed.kind === "name") return row.requesterName === parsed.value && !row.doctor?.id;
  return true;
}

export function matchesSupplierFilter(row: SupplierFilterRow, filterKey: string) {
  const parsed = parseEntityFilterKey(filterKey);
  if (!parsed) return true;
  if (parsed.kind === "id") return row.supplier?.id === parsed.value;
  if (parsed.kind === "name") return row.supplierName === parsed.value;
  return true;
}

export function labelFromFilterKey(
  filterKey: string,
  options: [string, string][]
) {
  return options.find(([k]) => k === filterKey)?.[1] ?? filterKey;
}
