/** Caminho do logotipo em /public (ex.: logo.png, logo.svg) ou URL absoluta */
export const LOGO_SRC = process.env.NEXT_PUBLIC_LOGO_SRC ?? "/logo.png";

export const LOGO_ALT =
  process.env.NEXT_PUBLIC_LOGO_ALT ?? "AION Engenharia";

/** Texto abaixo do logo (vazio = não exibe ao lado do logotipo customizado) */
export const LOGO_SUBTITLE = process.env.NEXT_PUBLIC_LOGO_SUBTITLE ?? "";

export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME ?? "AION Engenharia — Gestão de Equipamentos de Terceiros";
