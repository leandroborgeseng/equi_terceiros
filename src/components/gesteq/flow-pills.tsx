import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type FlowStep = {
  id: string;
  label: string;
  done: boolean;
};

export function FlowPills({
  steps,
  activeId,
  onSelect,
}: {
  steps: FlowStep[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1">
      {steps.map((step, i) => {
        const active = activeId === step.id;
        return (
          <div key={step.id} className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSelect(step.id)}
              className={cn(
                "inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-full border px-3 font-mono-data text-[11.5px] font-semibold transition-all",
                step.done
                  ? "border-[var(--brand-line)] bg-[var(--brand-soft)] text-[var(--brand-ink)]"
                  : active
                    ? "border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)]"
                    : "border-[var(--line-2)] bg-transparent text-[var(--faint)]"
              )}
            >
              {step.done ? (
                <Check className="h-3 w-3" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              )}
              {step.label}
            </button>
            {i < steps.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-[var(--line)]" />}
          </div>
        );
      })}
    </div>
  );
}
