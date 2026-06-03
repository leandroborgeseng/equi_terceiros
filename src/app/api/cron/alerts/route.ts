import { NextResponse } from "next/server";
import { runAlertsJob } from "@/lib/alerts-job";

export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  const expected = process.env.CRON_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const result = await runAlertsJob();
  return NextResponse.json({ ok: true, ...result });
}
