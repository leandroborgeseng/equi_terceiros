import { cn } from "@/lib/utils";

export function FilterPills<T extends string | null>({
  label,
  options,
  value,
  onChange,
  dotClass,
}: {
  label: string;
  options: { value: T; label: string; dot?: string }[];
  value: T;
  onChange: (v: T) => void;
  dotClass?: (dot: string) => string;
}) {
  return (
    <div>
      <div className="gesteq-eyebrow mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-[10px] border px-3 text-xs font-semibold transition-all",
                active
                  ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                  : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-2)]"
              )}
            >
              {opt.dot && (
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    dotClass ? dotClass(opt.dot) : `gesteq-spine-${opt.dot}`
                  )}
                />
              )}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
