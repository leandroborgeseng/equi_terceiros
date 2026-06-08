import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "gesteq-pill-primary",
  ghost: "gesteq-pill-ghost",
  slate: "gesteq-pill-slate",
  blue: "gesteq-pill-blue",
  amber: "gesteq-pill-amber",
  brand: "gesteq-pill-brand-soft",
} as const;

export function ActionPill({
  children,
  icon,
  variant = "ghost",
  href,
  onClick,
  className,
  title,
}: {
  children: ReactNode;
  icon?: ReactNode;
  variant?: keyof typeof variants;
  href?: string;
  onClick?: () => void;
  className?: string;
  title?: string;
}) {
  const cls = cn("gesteq-pill", variants[variant], className);

  if (href) {
    const isApi = href.startsWith("/api/");
    if (isApi) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={cls} title={title}>
          {icon}
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} title={title}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls} title={title}>
      {icon}
      {children}
    </button>
  );
}
