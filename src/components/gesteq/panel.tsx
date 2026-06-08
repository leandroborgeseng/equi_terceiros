import type { ReactNode } from "react";

export function Panel({
  title,
  eyebrow,
  right,
  children,
  pad = 20,
}: {
  title?: string;
  eyebrow?: string;
  right?: ReactNode;
  children: ReactNode;
  pad?: number;
}) {
  return (
    <div className="gesteq-card overflow-hidden">
      {(title || right) && (
        <div
          className="flex items-center justify-between gap-3 border-b border-[var(--line-2)]"
          style={{ padding: `14px ${pad}px` }}
        >
          <div className="min-w-0">
            {eyebrow && <div className="gesteq-eyebrow mb-0.5">{eyebrow}</div>}
            {title && <div className="font-display text-base font-semibold text-[var(--ink)]">{title}</div>}
          </div>
          {right}
        </div>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
}
