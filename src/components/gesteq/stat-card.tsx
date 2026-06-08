import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "brand",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "brand" | "bloqueado" | "pendente" | "inspecao" | "muted";
}) {
  const accents = {
    brand: "text-[var(--brand-ink)] bg-[var(--brand-soft)]",
    bloqueado: "text-[var(--bloqueado-ink)] bg-[var(--bloqueado-soft)]",
    pendente: "text-[var(--pendente-ink)] bg-[var(--pendente-soft)]",
    inspecao: "text-[var(--inspecao-ink)] bg-[var(--inspecao-soft)]",
    muted: "text-[var(--muted)] bg-[var(--surface-2)]",
  };

  return (
    <div className="gesteq-card p-5">
      <div className="flex items-center gap-4">
        <div className={cn("rounded-[var(--r-lg)] p-3", accents[accent])}>
          <Icon className="h-7 w-7" strokeWidth={1.6} />
        </div>
        <div>
          <p className="font-display text-2xl font-semibold text-[var(--ink)]">{value}</p>
          <p className="text-xs text-[var(--muted)]">{label}</p>
        </div>
      </div>
    </div>
  );
}
