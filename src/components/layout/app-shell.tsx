"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
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
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/enums";
import { ROLE_LABELS, isClinicalEngineering } from "@/lib/rbac";
import { NotificationBell } from "./notification-bell";
import { GestEqLogo } from "@/components/gesteq/logo";
import { ImpersonationPanel } from "./impersonation-panel";

const SIDEBAR_KEY = "aion-sidebar-collapsed";

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
  user: initialUser,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: UserRole; impersonating?: boolean; realRole?: UserRole };
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user ?? initialUser;
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

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
            <GestEqLogo size={32} href="/" showText={false} />
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
            "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-[var(--line)] bg-[var(--surface)] transition-[width,transform] duration-200 lg:static",
            collapsed ? "w-[72px]" : "w-[248px]",
            open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div
            className={cn(
              "hidden border-b border-[var(--line)] lg:flex lg:items-center",
              collapsed ? "justify-center px-2 py-4" : "justify-between px-[18px] py-5"
            )}
          >
            <GestEqLogo size={collapsed ? 32 : 36} href="/" showText={false} />
            {!collapsed && (
              <button
                type="button"
                onClick={toggleCollapsed}
                className="rounded-[var(--r)] p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)]"
                aria-label="Recolher menu"
                title="Recolher menu"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>

          {collapsed && (
            <div className="hidden border-b border-[var(--line)] px-2 py-2 lg:block">
              <button
                type="button"
                onClick={toggleCollapsed}
                className="mx-auto flex rounded-[var(--r)] p-2 text-[var(--muted)] hover:bg-[var(--surface-2)]"
                aria-label="Expandir menu"
                title="Expandir menu"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto px-3 py-4 lg:py-3">
            {!collapsed && <div className="gesteq-eyebrow px-2.5 py-2">Núcleo EC</div>}
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "mb-0.5 flex items-center rounded-[var(--r)] py-2 text-[13.5px] font-medium transition-colors",
                    collapsed ? "justify-center px-2" : "gap-2.5 px-2.5",
                    active
                      ? "bg-[var(--brand)] font-semibold text-white"
                      : "text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
                  )}
                >
                  <item.icon className={cn("h-[18px] w-[18px] shrink-0", !active && "opacity-70")} />
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                  {!collapsed && item.badge && item.href === "/pendencias" && (
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

          <div className={cn("hidden border-t border-[var(--line)] lg:block", collapsed ? "p-2" : "p-3")}>
            <ImpersonationPanel compact={collapsed} />
            <div className={cn("rounded-[var(--r)] bg-[var(--surface-2)]", collapsed ? "mt-2 p-2" : "mt-3 px-3 py-2.5")}>
              {!collapsed ? (
                <>
                  <p className="truncate text-sm font-medium text-[var(--ink)]">{user.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {ROLE_LABELS[user.role]}
                    {user.impersonating && " (demo)"}
                  </p>
                </>
              ) : (
                <div
                  className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-[var(--brand-soft)] text-[10px] font-bold text-[var(--brand-ink)]"
                  title={`${user.name} — ${ROLE_LABELS[user.role]}`}
                >
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sair"
              className={cn(
                "mt-2 flex items-center rounded-[var(--r)] text-sm text-[var(--muted)] hover:bg-[var(--surface-2)]",
                collapsed ? "mx-auto justify-center p-2" : "w-full gap-2 px-2.5 py-2"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && "Sair"}
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
          {user.impersonating && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[var(--r-lg)] border border-[color-mix(in_oklch,var(--brand)_28%,transparent)] bg-[var(--brand-soft)] px-3 py-2 text-sm text-[var(--brand-ink)]">
              <span>
                Modo demonstração: você está vendo o sistema como{" "}
                <strong>{ROLE_LABELS[user.role]}</strong>.
              </span>
            </div>
          )}
          {children}
        </motion.main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[var(--line)] bg-[color-mix(in_oklch,var(--surface)_95%,transparent)] backdrop-blur lg:hidden">
        {[
          { href: nav[0]?.href ?? "/", label: "Início", icon: nav[0]?.icon ?? Shield },
          { href: nav[1]?.href ?? nav[0]?.href ?? "/", label: nav[1]?.label?.split(" ")[0] ?? "Menu", icon: nav[1]?.icon ?? PackageSearch },
          { href: nav[2]?.href ?? nav[0]?.href ?? "/", label: nav[2]?.label?.split(" ")[0] ?? "Mais", icon: nav[2]?.icon ?? AlertTriangle },
          { href: nav[nav.length - 1]?.href ?? "/", label: "Conta", icon: Settings },
        ].map((item, i) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={`${item.href}-${i}`}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-[11px] font-medium",
                active ? "text-[var(--brand-ink)]" : "text-[var(--muted)]"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="max-w-[72px] truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
