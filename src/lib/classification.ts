import type { EquipmentClass } from "@/lib/enums";

const DAY_MS = 86_400_000;

export interface ClassificationInput {
  isUrgent?: boolean;
  plannedDate?: Date | string | null;
  expectedExitDate?: Date | string | null;
  entryDate?: Date | string | null;
}

/**
 * Sugere a classe (A/B/C/D) conforme Norma 445.000, seção 5.7.
 * A — permanência > 30 dias
 * B — período determinado (tem data de saída prevista, <= 30 dias)
 * C — esporádico (entra e sai no mesmo dia)
 * D — urgência/emergência
 * A EC pode ajustar manualmente.
 */
export function suggestEquipmentClass(input: ClassificationInput): EquipmentClass {
  if (input.isUrgent) return "D";

  const start = toDate(input.entryDate) ?? toDate(input.plannedDate) ?? new Date();
  const exit = toDate(input.expectedExitDate);

  if (exit) {
    const days = Math.round((exit.getTime() - start.getTime()) / DAY_MS);
    if (days > 30) return "A";
    if (days <= 0) return "C";
    return "B";
  }

  return "B";
}

/** Regra de negócio: eletivos exigem 72h úteis de antecedência (aprox. simplificada). */
export function meets72hRule(requestDate: Date | string, plannedDate: Date | string): boolean {
  const req = new Date(requestDate).getTime();
  const planned = new Date(plannedDate).getTime();
  return planned - req >= 72 * 3_600_000;
}

function toDate(value?: Date | string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
