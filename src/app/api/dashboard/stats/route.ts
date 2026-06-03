import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const [
    total,
    liberados,
    pendentes,
    bloqueados,
    vencidos,
    reprovados,
    porFornecedor,
    porMedico,
    porClasse,
  ] = await Promise.all([
    prisma.equipmentRequest.count(),
    prisma.equipmentRequest.count({
      where: { status: { in: ["LIBERADO", "LIBERADO_COM_RESTRICAO", "EM_USO"] } },
    }),
    prisma.equipmentRequest.count({
      where: {
        status: {
          in: [
            "AGUARDANDO_CADASTRO",
            "AGUARDANDO_DOCUMENTOS",
            "PENDENTE_DOCUMENTOS",
            "AGUARDANDO_INSPECAO",
          ],
        },
      },
    }),
    prisma.equipmentRequest.count({ where: { status: "BLOQUEADO" } }),
    prisma.equipmentRequest.count({
      where: { validUntil: { lt: new Date() }, status: { in: ["LIBERADO", "LIBERADO_COM_RESTRICAO"] } },
    }),
    prisma.equipmentRequest.count({ where: { status: "PENDENTE_DOCUMENTOS" } }),
    prisma.equipmentRequest.groupBy({
      by: ["supplierName"],
      _count: true,
      where: {
        status: { in: ["PENDENTE_DOCUMENTOS", "AGUARDANDO_DOCUMENTOS", "AGUARDANDO_CADASTRO"] },
      },
    }),
    prisma.equipmentRequest.groupBy({
      by: ["doctorId"],
      _count: true,
      where: { status: { notIn: ["LIBERADO", "RETIRADO"] } },
    }),
    prisma.equipmentRequest.groupBy({
      by: ["equipmentClass"],
      _count: true,
    }),
  ]);

  const submitted = await prisma.equipmentRequest.findMany({
    where: { submittedAt: { not: null }, homologatedAt: { not: null } },
    select: { submittedAt: true, homologatedAt: true },
  });

  let slaHours = 0;
  if (submitted.length > 0) {
    const totalMs = submitted.reduce((acc, r) => {
      if (!r.submittedAt || !r.homologatedAt) return acc;
      return acc + (r.homologatedAt.getTime() - r.submittedAt.getTime());
    }, 0);
    slaHours = Math.round(totalMs / submitted.length / 3600000);
  }

  const taxaReprovacao = total > 0 ? Math.round((reprovados / total) * 100) : 0;

  const queue = {
    aguardandoCadastro: await prisma.equipmentRequest.count({
      where: { status: "AGUARDANDO_CADASTRO" },
    }),
    aguardandoDocumentos: await prisma.equipmentRequest.count({
      where: { status: "AGUARDANDO_DOCUMENTOS" },
    }),
    pendenteDocumentos: reprovados,
    aguardandoInspecao: await prisma.equipmentRequest.count({
      where: { status: "AGUARDANDO_INSPECAO" },
    }),
    liberado: liberados,
    bloqueado: bloqueados,
    urgencia: await prisma.equipmentRequest.count({
      where: { status: "FLUXO_URGENCIA" },
    }),
    vencido: vencidos,
  };

  return NextResponse.json({
    total,
    liberados,
    pendentes,
    bloqueados,
    vencidos,
    taxaReprovacao,
    slaHomologacaoHoras: slaHours,
    documentosVencidos: await prisma.alert.count({
      where: { resolved: false, severity: "VENCIDO" },
    }),
    queue,
    porFornecedor,
    porMedico,
    porClasse: porClasse.map((c) => ({
      classe: c.equipmentClass ?? "—",
      _count: typeof c._count === "number" ? c._count : 0,
    })),
  });
}
