import { PrismaClient } from "@prisma/client";
import type { UserRole } from "../src/lib/enums";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Hospital@2026", 10);

  const users = [
    { email: "admin@hospital.local", name: "Administrador Sistema", role: "ADMIN" as UserRole },
    { email: "ec@hospital.local", name: "Engenharia Clínica", role: "ENGENHARIA_CLINICA" as UserRole },
    { email: "medico@hospital.local", name: "Dr. João Silva", role: "MEDICO" as UserRole, crm: "123456-SP" },
    { email: "fornecedor@hospital.local", name: "MedSupply Equipamentos", role: "FORNECEDOR" as UserRole },
    { email: "centro@hospital.local", name: "Coordenação Centro Cirúrgico", role: "CENTRO_CIRURGICO" as UserRole },
    { email: "cme@hospital.local", name: "CME / CCIH", role: "CME_CCIH_NSP" as UserRole },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        passwordHash: password,
        role: u.role,
        crm: "crm" in u ? u.crm : undefined,
      },
    });
  }

  const fornecedorUser = await prisma.user.findUnique({
    where: { email: "fornecedor@hospital.local" },
  });

  if (fornecedorUser) {
    const existingSupplier = await prisma.supplier.findFirst({
      where: { email: "contato@medsupply.com.br" },
    });
    if (!existingSupplier) {
      await prisma.supplier.create({
        data: {
        name: "MedSupply Equipamentos Ltda",
        cnpj: "12.345.678/0001-90",
        email: "contato@medsupply.com.br",
        phone: "(11) 3000-0000",
        userId: fornecedorUser.id,
        },
      });
    }
  }

  const medico = await prisma.user.findUnique({
    where: { email: "medico@hospital.local" },
  });

  if (medico) {
    const existing = await prisma.equipmentRequest.findFirst({
      where: { protocol: "EQ-2026-DEMO01" },
    });

    if (!existing) {
      const supplier = await prisma.supplier.findFirst();
      await prisma.equipmentRequest.create({
        data: {
          protocol: "EQ-2026-DEMO01",
          status: "AGUARDANDO_CADASTRO",
          requestDate: new Date(),
          usageSector: "Centro Cirúrgico — Sala 03",
          doctorId: medico.id,
          doctorCrm: "123456-SP",
          patientName: "Paciente Demonstração",
          medicalRecord: "PRONT-0001",
          plannedProcedure: "Cirurgia minimamente invasiva",
          plannedDate: new Date(Date.now() + 7 * 86400000),
          plannedTime: "08:00",
          clinicalJustification:
            "Equipamento necessário para procedimento de alta complexidade sem alternativa institucional disponível no prazo clínico.",
          noInstitutionalAlternative: true,
          technicalBenefit: "Maior precisão e redução de tempo cirúrgico",
          equipmentName: "Monitor Multiparâmetro",
          brand: "Philips",
          model: "MX450",
          serialNumber: "SN-DEMO-001",
          entryType: "FORNECEDOR",
          flowType: "ELETIVO",
          equipmentClass: "C",
          supplierId: supplier?.id,
          supplierName: supplier?.name ?? "MedSupply",
          ownerName: "Hospital Demo",
          ownerContact: "contato@hospital.local",
          assistentialRisk: "Médio",
          supplierToken: "demotoken123456",
          qrToken: "qr-demo-000001",
          wizardStep: 5,
          submittedAt: new Date(),
          documentChecklist: { create: {} },
          releaseStatus: { create: {} },
        },
      });
    }
  }

  console.log("Seed concluído. Senha padrão: Hospital@2026");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
