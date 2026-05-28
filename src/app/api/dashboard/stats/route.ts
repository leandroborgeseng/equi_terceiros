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
    emAnalise,
    reprovados,
    porFornecedor,
    porMedico,
  ] = await Promise.all([
    prisma.equipmentRequest.count(),
    prisma.equipmentRequest.count({
      where: { status: { in: ["LIBERADO", "LIBERADO_COM_RESTRICAO"] } },
    }),
    prisma.equipmentRequest.count({
      where: {
        status: {
          in: [
            "AGUARDANDO_DOCUMENTACAO",
            "DOCUMENTACAO_EM_ANALISE",
            "PENDENTE_COMPLEMENTO",
            "AGUARDANDO_INSPECAO",
          ],
        },
      },
    }),
    prisma.equipmentRequest.count({ where: { status: "BLOQUEADO" } }),
    prisma.equipmentRequest.count({ where: { status: "VENCIDO" } }),
    prisma.equipmentRequest.count({ where: { status: "DOCUMENTACAO_EM_ANALISE" } }),
    prisma.equipmentRequest.count({ where: { status: "PENDENTE_COMPLEMENTO" } }),
    prisma.equipmentRequest.groupBy({
      by: ["supplierName"],
      _count: true,
      where: {
        status: { in: ["PENDENTE_COMPLEMENTO", "AGUARDANDO_DOCUMENTACAO"] },
      },
    }),
    prisma.equipmentRequest.groupBy({
      by: ["doctorId"],
      _count: true,
      where: { status: { notIn: ["LIBERADO", "ARQUIVADO"] } },
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
    aguardandoDocumentacao: await prisma.equipmentRequest.count({
      where: { status: "AGUARDANDO_DOCUMENTACAO" },
    }),
    documentacaoEmAnalise: emAnalise,
    pendenteComplemento: reprovados,
    aguardandoInspecao: await prisma.equipmentRequest.count({
      where: { status: "AGUARDANDO_INSPECAO" },
    }),
    liberado: liberados,
    bloqueado: bloqueados,
    urgencia: await prisma.equipmentRequest.count({
      where: { OR: [{ status: "URGENCIA" }, { isUrgent: true }] },
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
  });
}
