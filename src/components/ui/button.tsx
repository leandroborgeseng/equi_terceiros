import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--r)] text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40 disabled:pointer-events-none disabled:opacity-45 active:translate-y-px",
  {
    variants: {
      variant: {
        default: "border border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm hover:bg-[var(--brand-dark)] hover:border-[var(--brand-dark)]",
        secondary: "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--line-2)]",
        outline: "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]",
        ghost: "border border-transparent bg-transparent text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
        danger: "border border-[color-mix(in_oklch,var(--bloqueado)_32%,transparent)] bg-transparent text-[var(--bloqueado-ink)] hover:bg-[var(--bloqueado-soft)]",
        warning: "border border-[color-mix(in_oklch,var(--pendente)_38%,transparent)] bg-[var(--pendente-soft)] text-[var(--pendente-ink)]",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-[var(--r-sm)] px-3 text-[13px]",
        lg: "h-12 rounded-[var(--r-lg)] px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
