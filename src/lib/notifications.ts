import { prisma } from "@/lib/prisma";

/** Notificação in-app via tabela Alert (e-mail pode ser plugado depois) */
export async function notifyRequestRejection(params: {
  requestId: string;
  protocol: string;
  doctorId: string;
  reason: string;
}) {
  await prisma.alert.create({
    data: {
      type: "DOCUMENTACAO",
      severity: "URGENT_7_DIAS",
      title: `Complemento necessário — ${params.protocol}`,
      message: params.reason,
      requestId: params.requestId,
    },
  });

  // Hook futuro: await sendEmail(doctor.email, ...)
}
