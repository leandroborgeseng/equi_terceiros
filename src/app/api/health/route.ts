import { NextResponse } from "next/server";
import {
  getAuthSecret,
  getDatabaseUrl,
  getNextAuthUrl,
  isEnvFullyConfigured,
  isUsingRailwayAutoConfig,
} from "@/lib/env";

export async function GET() {
  const manualConfig = isEnvFullyConfigured();
  const autoConfig = isUsingRailwayAutoConfig();

  return NextResponse.json({
    ok: true,
    status: manualConfig ? "ready" : autoConfig ? "ready_auto_config" : "ready_defaults",
    manualVariablesConfigured: manualConfig,
    railwayAutoConfig: autoConfig,
    resolved: {
      databaseUrl: getDatabaseUrl().replace(/prod\.db.*/, "prod.db"),
      nextAuthUrl: getNextAuthUrl(),
      hasSecret: !!getAuthSecret(),
    },
    hint: manualConfig
      ? "Variáveis Railway OK. Login: medico@hospital.local / Hospital@2026"
      : "Funcionando com defaults Railway. Recomendado: adicionar NEXTAUTH_SECRET em Variables.",
  });
}
