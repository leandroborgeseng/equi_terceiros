import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isClinicalEngineering } from "@/lib/rbac";
import { meets72hRule } from "@/lib/classification";

function sinceFromPeriod(period: string | null): Date | null {
  const now = Date.now();
  switch (period) {
    case "7d":
      return new Date(now - 7 * 86400000);
    case "30d":
      return new Date(now - 30 * 86400000);
    case "90d":
      return new Date(now - 90 * 86400000);
    case "12m":
      return new Date(now - 365 * 86400000);
    case "all":
    default:
      return null;
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !isClinicalEngineering(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "30d";
  const sector = searchParams.get("sector");
  const since = sinceFromPeriod(period);

  const periodWhere = since ? { createdAt: { gte: since } } : {};
  const sectorWhere = sector ? { usageSector: sector } : {};
  const baseWhere = { ...periodWhere, ...sectorWhere };

  const [
    totalAtivos,
    porClasse,
    bloqueios,
    eventosAdversos,
    pendentesRegularizacao,
    eletivos,
    homologados,
    setores,
  ] = await Promise.all([
    prisma.equipmentRequest.count({
      where: { status: { notIn: ["RETIRADO", "RASCUNHO"] }, ...sectorWhere },
    }),
    prisma.equipmentRequest.groupBy({
      by: ["equipmentClass"],
      _count: true,
      where: baseWhere,
    }),
    prisma.equipmentRequest.count({
      where: { status: "BLOQUEADO", ...baseWhere },
    }),
    prisma.adverseEvent.count({
      where: since ? { occurredAt: { gte: since } } : {},
    }),
    prisma.equipmentRequest.count({
      where: { status: "FLUXO_URGENCIA", regularizedAt: null, ...sectorWhere },
    }),
    prisma.equipmentRequest.findMany({
      where: { flowType: "ELETIVO", ...baseWhere },
      select: { requestDate: true, plannedDate: true },
    }),
    prisma.equipmentRequest.findMany({
      where: { submittedAt: { not: null }, homologatedAt: { not: null }, ...baseWhere },
      select: { submittedAt: true, homologatedAt: true },
    }),
    prisma.equipmentRequest.findMany({
      distinct: ["usageSector"],
      select: { usageSector: true },
    }),
  ]);

  // % com cadastro prévio (eletivos cumprindo 72h)
  const cadastroPrevioPct =
    eletivos.length > 0
      ? Math.round(
          (eletivos.filter((e) => meets72hRule(e.requestDate, e.plannedDate)).length /
            eletivos.length) *
            100
        )
      : 0;

  // SLA médio (horas) entre envio e homologação
  let slaHoras = 0;
  if (homologados.length > 0) {
    const totalMs = homologados.reduce((acc, r) => {
      if (!r.submittedAt || !r.homologatedAt) return acc;
      return acc + (r.homologatedAt.getTime() - r.submittedAt.getTime());
    }, 0);
    slaHoras = Math.round(totalMs / homologados.length / 3600000);
  }

  return NextResponse.json({
    period,
    sector: sector ?? null,
    totalAtivos,
    bloqueios,
    eventosAdversos,
    pendentesRegularizacao,
    cadastroPrevioPct,
    slaHoras,
    porClasse: ["A", "B", "C", "D"].map((classe) => ({
      classe,
      total:
        (porClasse.find((c) => c.equipmentClass === classe)?._count as number | undefined) ?? 0,
    })),
    setores: setores.map((s) => s.usageSector).filter(Boolean),
  });
}
