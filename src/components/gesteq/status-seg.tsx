import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  brand: "bg-[var(--brand)] text-white",
  liberado: "bg-[var(--liberado)] text-white",
  pendente: "bg-[var(--pendente)] text-white",
  danger: "bg-[var(--bloqueado)] text-white",
  restricao: "bg-[var(--restricao)] text-white",
};

export function StatusSeg<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string; tone?: keyof typeof TONES }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("gesteq-seg flex-wrap", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "text-xs",
            value === opt.value && opt.tone && TONES[opt.tone],
            value === opt.value && !opt.tone && "on"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
