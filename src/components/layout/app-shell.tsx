"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  Shield,
  LogOut,
  Menu,
  X,
  BarChart3,
  PackageSearch,
  AlertTriangle,
  Settings,
  KeyRound,
  Building2,
  Receipt,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/enums";
import { ROLE_LABELS, isClinicalEngineering } from "@/lib/rbac";
import { NotificationBell } from "./notification-bell";
import { GestEqLogo } from "@/components/gesteq/logo";

const navByRole: Record<UserRole, { href: string; label: string; icon: typeof LayoutDashboard; badge?: boolean }[]> = {
  ADMIN: [
    { href: "/dashboard/engenharia", label: "Fila de Homologação", icon: Shield },
    { href: "/equipamentos", label: "Equipamentos", icon: PackageSearch },
    { href: "/fornecedores", label: "Fornecedores", icon: Building2 },
    { href: "/notas-fiscais", label: "Notas Fiscais", icon: Receipt },
    { href: "/pendencias", label: "Pendências", icon: AlertTriangle, badge: true },
    { href: "/indicadores", label: "Indicadores", icon: BarChart3 },
    { href: "/convites", label: "Chaves de acesso", icon: KeyRound },
    { href: "/configuracoes", label: "Configurações", icon: Settings },
  ],
  ENGENHARIA_CLINICA: [
    { href: "/dashboard/engenharia", label: "Fila de Homologação", icon: Shield },
    { href: "/equipamentos", label: "Equipamentos", icon: PackageSearch },
    { href: "/fornecedores", label: "Fornecedores", icon: Building2 },
    { href: "/notas-fiscais", label: "Notas Fiscais", icon: Receipt },
    { href: "/pendencias", label: "Pendências", icon: AlertTriangle, badge: true },
    { href: "/indicadores", label: "Indicadores", icon: BarChart3 },
    { href: "/convites", label: "Chaves de acesso", icon: KeyRound },
  ],
  MEDICO: [{ href: "/dashboard/medico", label: "Minhas Solicitações", icon: ClipboardList }],
  FORNECEDOR: [{ href: "/dashboard/fornecedor", label: "Documentação", icon: ClipboardList }],
  CENTRO_CIRURGICO: [{ href: "/dashboard/centro-cirurgico", label: "Equipamentos", icon: LayoutDashboard }],
  CME_CCIH_NSP: [{ href: "/dashboard/cme", label: "Higienização", icon: Shield }],
};

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: UserRole };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = navByRole[user.role] ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_oklch,var(--surface)_88%,transparent)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg p-2"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <GestEqLogo size={32} href="/" />
          </div>
          <div className="flex items-center gap-2">
            {isClinicalEngineering(user.role) && <NotificationBell />}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-[var(--r-lg)] border border-[var(--line)] p-2 text-[var(--muted)]"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px] gap-0 lg:gap-6 lg:px-6 lg:py-0">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 flex w-[248px] flex-col border-r border-[var(--line)] bg-[var(--surface)] transition-transform lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="hidden border-b border-[var(--line)] px-[18px] py-5 lg:block">
            <GestEqLogo href="/" />
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 lg:py-3">
            <div className="gesteq-eyebrow px-2.5 py-2">Núcleo EC</div>
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "mb-0.5 flex items-center gap-2.5 rounded-[var(--r)] px-2.5 py-2 text-[13.5px] font-medium transition-colors",
                    active
                      ? "bg-[var(--brand)] font-semibold text-white"
                      : "text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
                  )}
                >
                  <item.icon className={cn("h-[18px] w-[18px]", !active && "opacity-70")} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.href === "/pendencias" && (
                    <span
                      className={cn(
                        "font-mono-data grid h-[18px] min-w-[18px] place-items-center rounded-[5px] px-1 text-[10.5px] font-semibold",
                        active
                          ? "bg-white/16 text-white"
                          : "bg-[var(--pendente-soft)] text-[var(--pendente-ink)]"
                      )}
                    >
                      ·
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden border-t border-[var(--line)] p-3 lg:block">
            <div className="rounded-[var(--r)] bg-[var(--surface-2)] px-3 py-2.5">
              <p className="truncate text-sm font-medium text-[var(--ink)]">{user.name}</p>
              <p className="text-xs text-[var(--muted)]">{ROLE_LABELS[user.role]}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-2 flex w-full items-center gap-2 rounded-[var(--r)] px-2.5 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)]"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </aside>

        {open && (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-black/30 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          />
        )}

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-w-0 flex-1 px-4 py-5 pb-24 lg:px-0 lg:py-6 lg:pb-6"
        >
          {children}
        </motion.main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[var(--line)] bg-[color-mix(in_oklch,var(--surface)_95%,transparent)] backdrop-blur lg:hidden">
        {[
          { href: nav[0]?.href ?? "/", label: "Fila", icon: Shield },
          { href: "/equipamentos", label: "Equipamentos", icon: PackageSearch },
          { href: "/pendencias", label: "Pendências", icon: AlertTriangle },
          { href: "/indicadores", label: "Indicadores", icon: BarChart3 },
        ].map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-[11px] font-medium",
                active ? "text-[var(--brand-ink)]" : "text-[var(--muted)]"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
