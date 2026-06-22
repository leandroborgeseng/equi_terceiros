/**
 * Importa parque legado Unimed Franca — equipamentos já homologados pela EC.
 * Idempotente: protocolos EQ-2026-UF-{medicoId}-{seq}.
 *
 * Uso: npm run db:seed:unimed
 * Produção (Railway): railway run npm run db:seed:unimed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const MAINTENANCE_VALID_UNTIL = new Date("2026-11-30T23:59:59.000Z");
const MAINTENANCE_PERFORMED_AT = new Date("2025-11-15T12:00:00.000Z");
const IMPORT_DATE = new Date("2026-06-22T12:00:00.000Z");
const DEFAULT_PASSWORD = "Hospital@2026";

const APPROVED_CHECKLIST = {
  item1Status: "SIM",
  item2Status: "SIM",
  item3Status: "SIM",
  item4Status: "SIM",
  item5Status: "NA",
  item6Status: "SIM",
  item7Status: "SIM",
  item8Status: "SIM",
  docStatus: "APROVADO",
  item1Obs: "Cadastro legado — formalizado pela EC (Unimed Franca).",
  item4Obs: "Manutenção preventiva válida até nov/2026.",
};

const APPROVED_INSPECTION = {
  item1Status: "CONFORME",
  item2Status: "CONFORME",
  item3Status: "CONFORME",
  item4Status: "CONFORME",
  item5Status: "NA",
  item6Status: "CONFORME",
  item7Status: "CONFORME",
  electricalSafetyTest: "SIM",
  electricalSafetyResult: "Conforme — cadastro legado",
  status: "LIBERADO",
  generalNotes: "Equipamento já em uso no parque — homologação retroativa EC (jun/2026).",
};

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function doctorEmail(medico) {
  if (medico.email) return medico.email;
  return `${slugify(medico.nome)}.${medico.id}@confirmacao-pendente.unimed-franca.local`;
}

function doctorCrm(medico) {
  if (medico.crm && medico.crm_uf) return `${medico.crm}-${medico.crm_uf}`;
  if (medico.cro) return `CRO-${medico.cro}`;
  return "A confirmar";
}

function formatAddress(endereco) {
  if (!endereco) return null;
  const parts = [
    endereco.logradouro,
    endereco.bairro,
    endereco.cidade && endereco.uf ? `${endereco.cidade}/${endereco.uf}` : endereco.cidade,
    endereco.cep ? `CEP ${endereco.cep}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" — ") : null;
}

function protocolFor(medicoId, seq) {
  return `EQ-2026-UF-${String(medicoId).padStart(2, "0")}-${String(seq).padStart(2, "0")}`;
}

function internalOsFor(medicoId, seq) {
  return `OS-2026-UF-${String(medicoId).padStart(2, "0")}-${String(seq).padStart(2, "0")}`;
}

async function main() {
  const raw = readFileSync(join(__dirname, "data/unimed-franca-parque.json"), "utf8");
  const dataset = JSON.parse(raw);

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const ecUser =
    (await prisma.user.findUnique({ where: { email: "ec@hospital.local" } })) ??
    (await prisma.user.findFirst({ where: { role: "ENGENHARIA_CLINICA" } }));

  if (!ecUser) {
    throw new Error("Usuário EC não encontrado. Rode npm run db:seed antes.");
  }

  let doctorsCreated = 0;
  let doctorsUpdated = 0;
  let equipmentCreated = 0;
  let equipmentSkipped = 0;

  for (const medico of dataset.medicos) {
    const email = doctorEmail(medico);
    const crm = doctorCrm(medico);
    const phone = medico.endereco?.telefone ?? null;
    const address = formatAddress(medico.endereco);

    const existingDoctor = await prisma.user.findUnique({ where: { email } });
    const doctor = await prisma.user.upsert({
      where: { email },
      update: {
        name: medico.nome,
        crm,
        phone: phone ?? undefined,
        active: true,
        role: "MEDICO",
      },
      create: {
        email,
        name: medico.nome,
        passwordHash,
        role: "MEDICO",
        crm,
        phone: phone ?? undefined,
        active: true,
      },
    });

    if (existingDoctor) doctorsUpdated++;
    else doctorsCreated++;

    let seq = 0;
    for (const eq of medico.equipamentos) {
      seq += 1;
      const protocol = protocolFor(medico.id, seq);
      const internalOs = internalOsFor(medico.id, seq);

      const exists = await prisma.equipmentRequest.findUnique({ where: { protocol } });
      if (exists) {
        equipmentSkipped++;
        continue;
      }

      const serialNumber = eq.numero_serie?.trim() || `S/N-PENDENTE-${protocol}`;
      const usageSector = "Centro Cirúrgico / CME — Unimed Franca";
      const ownerContact = phone ?? email;

      const equipment = await prisma.equipment.create({
        data: {
          name: eq.nome_formal,
          brand: "N/A",
          model: eq.descricao_informal,
          serialNumber,
          ownerName: medico.nome,
          ownerContact,
          riskLevel: "Medio",
        },
      });

      await prisma.maintenanceRecord.create({
        data: {
          equipmentId: equipment.id,
          performedAt: MAINTENANCE_PERFORMED_AT,
          validUntil: MAINTENANCE_VALID_UNTIL,
          provider: "Manutenção preventiva — parque legado Unimed Franca",
          notes: `Importado ${dataset.gerado_em}. ${eq.descricao_informal}. Validade nov/2026.`,
        },
      });

      const request = await prisma.equipmentRequest.create({
        data: {
          protocol,
          internalOs,
          qrToken: randomUUID(),
          supplierToken: randomUUID().replace(/-/g, ""),
          status: "EM_USO",
          flowType: "ELETIVO",
          entryType: "MEDICO",
          originatedByEc: true,
          alreadyInPark: true,
          registeredById: ecUser.id,
          doctorId: doctor.id,
          doctorCrm: crm,
          requesterName: medico.nome,
          requesterEmail: email,
          requesterPhone: phone,
          requestDate: IMPORT_DATE,
          submittedAt: IMPORT_DATE,
          homologatedAt: IMPORT_DATE,
          releasedAt: IMPORT_DATE,
          inUseAt: IMPORT_DATE,
          validUntil: MAINTENANCE_VALID_UNTIL,
          entryDate: IMPORT_DATE,
          usageSector,
          destinationSector: usageSector,
          storageLocation: address,
          equipmentId: equipment.id,
          equipmentName: eq.nome_formal,
          brand: "N/A",
          model: eq.descricao_informal,
          serialNumber,
          originPatrimony: eq.patrimonio,
          equipmentClass: "C",
          supplierName: medico.nome,
          ownerName: medico.nome,
          ownerContact,
          ownerDocument: medico.cpf,
          assistentialRisk: "Medio",
          patientName: "N/A — parque legado",
          medicalRecord: "LEGADO-UF",
          plannedProcedure: medico.especialidade,
          plannedDate: IMPORT_DATE,
          plannedTime: "08:00",
          clinicalJustification:
            "Equipamento de terceiro já em uso no parque tecnológico — cadastro e homologação retroativa pela Engenharia Clínica (Unimed Franca).",
          noInstitutionalAlternative: false,
          technicalBenefit: "Continuidade assistencial — equipamento já utilizado pelo médico credenciado.",
          wizardStep: 5,
          documentChecklist: {
            create: {
              ...APPROVED_CHECKLIST,
              reviewedBy: ecUser.id,
              reviewedAt: IMPORT_DATE,
            },
          },
          technicalInspection: {
            create: {
              ...APPROVED_INSPECTION,
              inspectorId: ecUser.id,
              inspectedAt: IMPORT_DATE,
              labelPrintedAt: IMPORT_DATE,
            },
          },
          releaseStatus: {
            create: {
              labelStatus: "LIBERADO",
              validUntil: MAINTENANCE_VALID_UNTIL,
              sector: usageSector,
              technicalLead: ecUser.name,
              generatedAt: IMPORT_DATE,
            },
          },
          responsibilityTerm: {
            create: {
              accepted: false,
              signedByDoctor: false,
              ecReviewed: true,
              ecReviewerId: ecUser.id,
              signerName: medico.nome,
              generatedById: ecUser.id,
            },
          },
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: ecUser.id,
          action: "LEGACY_PARK_IMPORTED",
          entity: "EquipmentRequest",
          entityId: request.id,
          metadata: JSON.stringify({
            cooperativa: dataset.cooperativa,
            medicoId: medico.id,
            especialidade: medico.especialidade,
            confirmacaoPendente: !medico.confirmacao_enviada,
          }),
        },
      });

      equipmentCreated++;
    }
  }

  console.log("Importação Unimed Franca concluída.");
  console.log(`  Médicos criados: ${doctorsCreated}`);
  console.log(`  Médicos atualizados: ${doctorsUpdated}`);
  console.log(`  Equipamentos importados: ${equipmentCreated}`);
  console.log(`  Equipamentos já existentes (ignorados): ${equipmentSkipped}`);
  console.log(`  Manutenção válida até: ${MAINTENANCE_VALID_UNTIL.toISOString().slice(0, 10)}`);
  console.log(`  Senha padrão médicos novos: ${DEFAULT_PASSWORD}`);
  console.log("  E-mails placeholder: *@confirmacao-pendente.unimed-franca.local");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
