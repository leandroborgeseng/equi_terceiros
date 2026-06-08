import { ProgressMeter } from "@/components/gesteq/progress-meter";

const STATUS_COLORS: Record<string, string> = {
  docs: "var(--docs)",
  pendente: "var(--pendente)",
  inspecao: "var(--inspecao)",
  liberado: "var(--liberado)",
  bloqueado: "var(--bloqueado)",
  urgencia: "var(--urgencia)",
};

export function StatusBars({
  items,
}: {
  items: { label: string; value: number; cls: string }[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="grid gap-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-[92px] shrink-0 text-[12.5px] text-[var(--ink-2)]">{item.label}</span>
          <ProgressMeter
            className="h-[22px] flex-1 rounded-md"
            value={item.value}
            total={max}
            tone={STATUS_COLORS[item.cls] ?? "var(--brand)"}
            height={22}
          />
          <span className="font-mono-data w-6 shrink-0 text-right text-[13px] font-semibold text-[var(--ink)]">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
