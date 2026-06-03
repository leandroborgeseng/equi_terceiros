import { prisma } from "@/lib/prisma";

const MS_DAY = 86400000;

function severityForDaysLeft(days: number) {
  if (days < 0) return "VENCIDO" as const;
  if (days === 0) return "VENCIMENTO" as const;
  if (days <= 7) return "URGENT_7_DIAS" as const;
  if (days <= 15) return "WARN_15_DIAS" as const;
  if (days <= 30) return "INFO_30_DIAS" as const;
  return null;
}

export async function runAlertsJob() {
  const now = new Date();
  let created = 0;

  const requests = await prisma.equipmentRequest.findMany({
    where: {
      status: { in: ["LIBERADO", "LIBERADO_COM_RESTRICAO", "EM_USO", "FLUXO_URGENCIA"] },
    },
    select: {
      id: true,
      protocol: true,
      validUntil: true,
      isUrgent: true,
      submittedAt: true,
      status: true,
      regularizationDueAt: true,
      regularizedAt: true,
    },
  });

  for (const r of requests) {
    if (r.validUntil) {
      const days = Math.ceil((r.validUntil.getTime() - now.getTime()) / MS_DAY);
      const severity = severityForDaysLeft(days);
      if (severity) {
        const exists = await prisma.alert.findFirst({
          where: { requestId: r.id, type: "DOCUMENTACAO", resolved: false },
        });
        if (!exists) {
          await prisma.alert.create({
            data: {
              type: "DOCUMENTACAO",
              severity,
              title: `Documentação ${r.protocol}`,
              message: `Validade em ${days} dia(s)`,
              requestId: r.id,
              dueDate: r.validUntil,
            },
          });
          created++;
        }
      }
    }

    // Regularização de urgência (Classe D): pendência D+1
    if (r.status === "FLUXO_URGENCIA" && !r.regularizedAt && r.regularizationDueAt) {
      const overdue = now.getTime() >= r.regularizationDueAt.getTime();
      const exists = await prisma.alert.findFirst({
        where: { requestId: r.id, type: "REGULARIZACAO_URGENCIA", resolved: false },
      });
      if (overdue && !exists) {
        await prisma.alert.create({
          data: {
            type: "REGULARIZACAO_URGENCIA",
            severity: "VENCIDO",
            title: `Regularização pendente — ${r.protocol}`,
            message: "Equipamento de urgência (Classe D) aguarda regularização (D+1)",
            requestId: r.id,
            dueDate: r.regularizationDueAt,
          },
        });
        created++;
      }
    }
  }

  const pendingWithdrawal = await prisma.withdrawalRecord.count({
    where: { completed: false },
  });
  if (pendingWithdrawal > 0) {
    const exists = await prisma.alert.findFirst({
      where: { type: "RETIRADA_PENDENTE", resolved: false },
    });
    if (!exists) {
      await prisma.alert.create({
        data: {
          type: "RETIRADA_PENDENTE",
          severity: "WARN_15_DIAS",
          title: "Retiradas pendentes",
          message: `${pendingWithdrawal} equipamento(s) aguardando retirada`,
        },
      });
      created++;
    }
  }

  return { created, checked: requests.length };
}
