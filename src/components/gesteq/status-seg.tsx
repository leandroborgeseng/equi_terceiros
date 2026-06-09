import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  brand: "!bg-[var(--brand)] !text-white shadow-sm",
  liberado: "!bg-[var(--liberado)] !text-white shadow-sm",
  pendente: "!bg-[var(--pendente)] !text-white shadow-sm",
  danger: "!bg-[var(--bloqueado)] !text-white shadow-sm",
  restricao: "!bg-[var(--restricao)] !text-white shadow-sm",
};

export function StatusSeg<T extends string>({
  options,
  value,
  onChange,
  className,
  variant = "seg",
}: {
  options: { value: T; label: string; tone?: keyof typeof TONES; desc?: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  variant?: "seg" | "verdict";
}) {
  if (variant === "verdict") {
    return (
      <div className={cn("grid gap-2 sm:grid-cols-2 lg:grid-cols-4", className)}>
        {options.map((opt) => {
          const on = value === opt.value;
          const tone = opt.tone ?? "brand";
          const inkVar =
            tone === "liberado"
              ? "var(--liberado-ink)"
              : tone === "pendente"
                ? "var(--pendente-ink)"
                : tone === "restricao"
                  ? "var(--restricao-ink)"
                  : tone === "danger"
                    ? "var(--bloqueado-ink)"
                    : "var(--brand-ink)";
          const softVar =
            tone === "liberado"
              ? "var(--liberado-soft)"
              : tone === "pendente"
                ? "var(--pendente-soft)"
                : tone === "restricao"
                  ? "var(--restricao-soft)"
                  : tone === "danger"
                    ? "var(--bloqueado-soft)"
                    : "var(--brand-soft)";
          const colorVar =
            tone === "liberado"
              ? "var(--liberado)"
              : tone === "pendente"
                ? "var(--pendente)"
                : tone === "restricao"
                  ? "var(--restricao)"
                  : tone === "danger"
                    ? "var(--bloqueado)"
                    : "var(--brand)";

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "cursor-pointer rounded-[var(--r)] border-[1.5px] p-3 text-left transition-all",
                on
                  ? "shadow-sm"
                  : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-2)] hover:bg-[var(--surface-2)]"
              )}
              style={
                on
                  ? {
                      borderColor: `color-mix(in oklch, ${colorVar} 60%, transparent)`,
                      background: softVar,
                      boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${colorVar} 30%, transparent)`,
                    }
                  : undefined
              }
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: colorVar }}
                />
                <span
                  className="text-[13.5px] font-bold"
                  style={{ color: on ? inkVar : "var(--ink)" }}
                >
                  {opt.label}
                </span>
              </div>
              {opt.desc && (
                <p
                  className="mt-1 pl-4 text-[11.5px] leading-snug"
                  style={{ color: on ? inkVar : "var(--faint)" }}
                >
                  {opt.desc}
                </p>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("gesteq-seg flex-wrap", className)}>
      {options.map((opt) => {
        const on = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "text-xs",
              on && "on",
              on && opt.tone && TONES[opt.tone],
              on && !opt.tone && "!bg-[var(--surface)] !text-[var(--ink)] shadow-sm"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
