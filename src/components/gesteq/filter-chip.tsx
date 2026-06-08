import { cn } from "@/lib/utils";

export function FilterChip({
  active,
  onClick,
  count,
  label,
  dotCls,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  label: string;
  dotCls: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-[10px] border px-3 py-2 transition-all",
        active
          ? "border-[var(--brand)] bg-[var(--brand)] text-white"
          : "border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
      )}
    >
      <span
        className={cn("h-2 w-2 rounded-full", `gesteq-spine-${dotCls}`)}
        style={active ? { boxShadow: "0 0 0 2px oklch(1 0 0 / 0.18)" } : undefined}
      />
      <span
        className={cn(
          "font-mono-data text-[17px] font-semibold leading-none",
          active ? "text-white" : "text-[var(--ink)]"
        )}
      >
        {count}
      </span>
      <span
        className={cn(
          "text-[12.5px] font-semibold whitespace-nowrap",
          active ? "text-white/85" : "text-[var(--muted)]"
        )}
      >
        {label}
      </span>
    </button>
  );
}
