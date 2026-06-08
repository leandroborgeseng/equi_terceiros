import type { ReactNode } from "react";

export function PageHeader({
  eyebrow = "Engenharia Clínica",
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="gesteq-eyebrow mb-1.5">{eyebrow}</div>
        <h1 className="font-display m-0 text-[27px] font-semibold tracking-tight text-[var(--ink)]">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-[13.5px] text-[var(--muted)]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
