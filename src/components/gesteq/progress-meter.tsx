import { cn } from "@/lib/utils";

export function ProgressMeter({
  value,
  total,
  tone = "var(--brand)",
  height = 4,
  className,
}: {
  value: number;
  total: number;
  tone?: string;
  height?: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div
      className={cn("overflow-hidden rounded-[5px] bg-[var(--surface-2)]", className)}
      style={{ height }}
    >
      <div
        className="h-full rounded-[5px] transition-all duration-500"
        style={{ width: `${pct}%`, background: tone, minWidth: value > 0 ? 6 : 0 }}
      />
    </div>
  );
}
