"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { APP_NAME, LOGO_ALT, LOGO_SRC, LOGO_SUBTITLE } from "@/lib/brand";

export function GestEqLogo({
  size = 36,
  showText = true,
  showSubtitle,
  href,
  className,
}: {
  size?: number;
  /** Exibe nome da aplicação ao lado (somente no fallback sem imagem) */
  showText?: boolean;
  /** Legenda opcional abaixo do nome */
  showSubtitle?: boolean;
  href?: string;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const useCustomLogo = Boolean(LOGO_SRC) && !imgError;

  const subtitleVisible =
    showSubtitle ?? (useCustomLogo ? Boolean(LOGO_SUBTITLE) : showText);

  const inner = (
    <div className={cn("flex items-center gap-2.5", className)}>
      {useCustomLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={LOGO_SRC}
          alt={LOGO_ALT}
          height={size}
          style={{
            height: size,
            width: "auto",
            maxWidth: Math.round(size * 8),
          }}
          className="block shrink-0 object-contain object-left"
          onError={() => setImgError(true)}
        />
      ) : (
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
      )}

      {!useCustomLogo && showText && (
        <div className="leading-none">
          <div className="font-display text-sm font-semibold tracking-tight text-[var(--ink)]">
            GestEq
          </div>
          {subtitleVisible && (
            <div className="gesteq-eyebrow mt-0.5 text-[8.5px]">Eng. Clínica</div>
          )}
        </div>
      )}

      {useCustomLogo && subtitleVisible && LOGO_SUBTITLE && (
        <div className="gesteq-eyebrow leading-none">{LOGO_SUBTITLE}</div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex" aria-label={LOGO_ALT || APP_NAME}>
        {inner}
      </Link>
    );
  }
  return inner;
}
