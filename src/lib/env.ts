/**
 * Resolve variáveis em produção no Railway quando o painel Variables não foi preenchido.
 * Recomendado: configurar NEXTAUTH_SECRET, AUTH_SECRET, DATABASE_URL e NEXTAUTH_URL manualmente.
 */

export function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? "file:/data/prod.db";
}

export function getNextAuthUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }
  const domain =
    process.env.RAILWAY_PUBLIC_DOMAIN ??
    process.env.RAILWAY_STATIC_URL ??
    process.env.RAILWAY_PRIVATE_DOMAIN;
  if (domain) {
    const host = domain.startsWith("http") ? domain : `https://${domain}`;
    return host.replace(/\/$/, "");
  }
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}

export function getAuthSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NEXTAUTH_SECRET) return process.env.NEXTAUTH_SECRET;

  const domain =
    process.env.RAILWAY_PUBLIC_DOMAIN ??
    process.env.RAILWAY_STATIC_URL ??
    "equiterceiros-production.up.railway.app";

  // Segredo determinístico por domínio — troque por NEXTAUTH_SECRET no Railway em produção real
  return `railway-auto-secret-${domain}-min-32-chars!!`;
}

export function isEnvFullyConfigured() {
  return !!(
    process.env.DATABASE_URL &&
    (process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET) &&
    process.env.NEXTAUTH_URL
  );
}

export function isUsingRailwayAutoConfig() {
  return !isEnvFullyConfigured() && !!process.env.RAILWAY_ENVIRONMENT;
}
