import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Hospital@2026", 10);

  const users = [
    { email: "admin@hospital.local", name: "Administrador Sistema", role: "ADMIN" },
    { email: "ec@hospital.local", name: "Engenharia Clínica", role: "ENGENHARIA_CLINICA" },
    { email: "medico@hospital.local", name: "Dr. João Silva", role: "MEDICO", crm: "123456-SP" },
    { email: "fornecedor@hospital.local", name: "MedSupply Equipamentos", role: "FORNECEDOR" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash: password, active: true },
      create: {
        email: u.email,
        name: u.name,
        passwordHash: password,
        role: u.role,
        crm: u.crm,
        active: true,
      },
    });
  }

  console.log("Seed produção OK — usuários demo disponíveis (senha: Hospital@2026)");
}

main()
  .catch((e) => {
    console.error("Seed falhou:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
