import Link from "next/link";
import { cn } from "@/lib/utils";

export function GestEqLogo({
  size = 36,
  showText = true,
  href,
  className,
}: {
  size?: number;
  showText?: boolean;
  href?: string;
  className?: string;
}) {
  const inner = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative flex shrink-0 items-center justify-center rounded-[9px] bg-[var(--brand)] font-display font-bold text-white shadow-[inset_0_1px_0_oklch(1_0_0/0.18)]"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
      >
        GE
        <span
          className="absolute bottom-1 right-1 h-[5px] w-[5px] rounded-full bg-[var(--citrus)]"
          aria-hidden
        />
      </div>
      {showText && (
        <div className="leading-none">
          <div className="font-display text-sm font-semibold tracking-tight text-[var(--ink)]">GestEq</div>
          <div className="gesteq-eyebrow mt-0.5 text-[8.5px]">Eng. Clínica</div>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {inner}
      </Link>
    );
  }
  return inner;
}
