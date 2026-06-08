import { EQUIPMENT_CLASS_LABELS, type EquipmentClass } from "@/lib/enums";

export function ClassTag({
  classe,
  withDesc = false,
}: {
  classe: EquipmentClass | string | null | undefined;
  withDesc?: boolean;
}) {
  if (!classe) return null;
  const key = classe as EquipmentClass;
  const label = EQUIPMENT_CLASS_LABELS[key] ?? `Classe ${classe}`;
  return (
    <span
      title={label}
      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2 py-0.5 font-mono-data text-[11px] font-semibold text-[var(--ink-2)]"
    >
      <b className="font-display text-xs">{classe}</b>
      {withDesc && <span className="font-normal text-[var(--faint)]">{label}</span>}
    </span>
  );
}
