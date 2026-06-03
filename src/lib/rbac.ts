import type { UserRole } from "@/lib/enums";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  ENGENHARIA_CLINICA: "Engenharia Clínica",
  MEDICO: "Médico",
  FORNECEDOR: "Fornecedor",
  CENTRO_CIRURGICO: "Centro Cirúrgico",
  CME_CCIH_NSP: "CME / CCIH / NSP",
};

export const ROLE_ROUTES: Record<UserRole, string> = {
  ADMIN: "/dashboard/engenharia",
  ENGENHARIA_CLINICA: "/dashboard/engenharia",
  MEDICO: "/dashboard/medico",
  FORNECEDOR: "/dashboard/fornecedor",
  CENTRO_CIRURGICO: "/dashboard/centro-cirurgico",
  CME_CCIH_NSP: "/dashboard/cme",
};

export function canAccessRoute(role: UserRole, path: string): boolean {
  if (role === "ADMIN") return true;
  if (path.startsWith("/api/public")) return true;
  if (path.startsWith("/fornecedor/")) return true;

  const rolePrefixes: Record<UserRole, string[]> = {
    ADMIN: ["/dashboard", "/api"],
    ENGENHARIA_CLINICA: ["/dashboard/engenharia", "/dashboard/executivo", "/equipamentos", "/fornecedores", "/notas-fiscais", "/pendencias", "/indicadores", "/convites", "/api/requests", "/api/equipamentos", "/api/suppliers", "/api/invoices", "/api/uploads", "/api/inspections", "/api/checklist", "/api/labels", "/api/gallery", "/api/alerts", "/api/dashboard", "/api/indicators", "/api/images", "/api/invites"],
    MEDICO: ["/dashboard/medico", "/api/requests"],
    FORNECEDOR: ["/dashboard/fornecedor", "/fornecedor", "/api/requests", "/api/uploads"],
    CENTRO_CIRURGICO: ["/dashboard/centro-cirurgico", "/api/requests"],
    CME_CCIH_NSP: ["/dashboard/cme", "/api/requests", "/api/adverse-events"],
  };

  return rolePrefixes[role]?.some((p) => path.startsWith(p)) ?? false;
}

export function isClinicalEngineering(role: UserRole) {
  return role === "ENGENHARIA_CLINICA" || role === "ADMIN";
}

export function canHomologate(role: UserRole) {
  return isClinicalEngineering(role);
}

export function canCreateRequest(role: UserRole) {
  return role === "MEDICO" || role === "ADMIN" || role === "ENGENHARIA_CLINICA";
}

export function canManageUsers(role: UserRole) {
  return role === "ADMIN";
}

export function canManageInvites(role: UserRole) {
  return role === "ENGENHARIA_CLINICA" || role === "ADMIN";
}

export const ALL_ROLES: UserRole[] = [
  "ADMIN",
  "ENGENHARIA_CLINICA",
  "MEDICO",
  "FORNECEDOR",
  "CENTRO_CIRURGICO",
  "CME_CCIH_NSP",
];
