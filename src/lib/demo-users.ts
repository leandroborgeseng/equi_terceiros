import type { UserRole } from "@/lib/enums";

/** Contas demo do seed — usadas na personificação (somente admin). */
export const DEMO_USER_EMAILS: Record<UserRole, string> = {
  ADMIN: "admin@hospital.local",
  ENGENHARIA_CLINICA: "ec@hospital.local",
  MEDICO: "medico@hospital.local",
  FORNECEDOR: "fornecedor@hospital.local",
  CENTRO_CIRURGICO: "centro@hospital.local",
  CME_CCIH_NSP: "cme@hospital.local",
};
