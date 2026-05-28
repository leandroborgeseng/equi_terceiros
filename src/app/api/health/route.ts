import { NextResponse } from "next/server";

export async function GET() {
  const hasDb = !!process.env.DATABASE_URL;
  const hasSecret = !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
  const hasUrl = !!process.env.NEXTAUTH_URL;
  const ok = hasDb && hasSecret && hasUrl;

  return NextResponse.json(
    {
      ok,
      status: ok ? "ready" : "misconfigured",
      checks: {
        DATABASE_URL: hasDb,
        NEXTAUTH_SECRET_or_AUTH_SECRET: hasSecret,
        NEXTAUTH_URL: hasUrl,
      },
      port: process.env.PORT ?? "8080",
      hint: ok
        ? "Login: medico@hospital.local / Hospital@2026"
        : "Adicione Variables no Railway (railway.env.example)",
    },
    { status: ok ? 200 : 503 }
  );
}
