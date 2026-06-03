import { NextResponse } from "next/server";

/** Endpoint para confirmar sync client-side; processamento real é no browser */
export async function POST() {
  return NextResponse.json({ ok: true, message: "Use syncPendingUploads no cliente" });
}
