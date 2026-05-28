import { NextResponse } from "next/server";

export async function GET() {
  const hasDb = !!process.env.DATABASE_URL;
  const hasSecret = !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
  const hasUrl = !!process.env.NEXTAUTH_URL;

  const ok = hasDb && hasSecret && hasUrl;

  return NextResponse.json({
    ok,
    checks: {
      DATABASE_URL: hasDb,
      NEXTAUTH_SECRET_or_AUTH_SECRET: hasSecret,
      NEXTAUTH_URL: hasUrl,
    },
    hint: ok
      ? "Configuração OK. Login demo: medico@hospital.local / Hospital@2026"
      : "Configure Variables no Railway (veja railway.env.example)",
  });
}
