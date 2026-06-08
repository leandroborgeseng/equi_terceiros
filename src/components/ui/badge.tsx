import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  default: "bg-[var(--surface-2)] text-[var(--ink-2)]",
  success: "bg-[var(--liberado-soft)] text-[var(--liberado-ink)] ring-1 ring-[color-mix(in_oklch,var(--liberado)_30%,transparent)]",
  warning: "bg-[var(--restricao-soft)] text-[var(--restricao-ink)] ring-1 ring-[color-mix(in_oklch,var(--restricao)_30%,transparent)]",
  danger: "bg-[var(--bloqueado-soft)] text-[var(--bloqueado-ink)] ring-1 ring-[color-mix(in_oklch,var(--bloqueado)_30%,transparent)]",
  orange: "bg-[var(--restricao-soft)] text-[var(--restricao-ink)] ring-1 ring-[color-mix(in_oklch,var(--restricao)_30%,transparent)]",
  info: "bg-[var(--inspecao-soft)] text-[var(--inspecao-ink)] ring-1 ring-[color-mix(in_oklch,var(--inspecao)_30%,transparent)]",
  purple: "bg-[var(--docs-soft)] text-[var(--docs-ink)] ring-1 ring-[color-mix(in_oklch,var(--docs)_30%,transparent)]",
  successDark: "bg-[var(--brand)] text-white",
  grayDark: "bg-[var(--muted)] text-white",
};

export function Badge({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: keyof typeof variants;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
