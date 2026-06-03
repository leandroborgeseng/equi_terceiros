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
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/enums";
import { ROLE_LABELS } from "@/lib/rbac";

const navByRole: Record<UserRole, { href: string; label: string; icon: typeof LayoutDashboard }[]> = {
  ADMIN: [
    { href: "/dashboard/engenharia", label: "Fila de Homologação", icon: Shield },
    { href: "/equipamentos", label: "Equipamentos", icon: PackageSearch },
    { href: "/pendencias", label: "Pendências", icon: AlertTriangle },
    { href: "/indicadores", label: "Indicadores", icon: BarChart3 },
    { href: "/configuracoes", label: "Configurações", icon: Settings },
  ],
  ENGENHARIA_CLINICA: [
    { href: "/dashboard/engenharia", label: "Fila de Homologação", icon: Shield },
    { href: "/equipamentos", label: "Equipamentos", icon: PackageSearch },
    { href: "/pendencias", label: "Pendências", icon: AlertTriangle },
    { href: "/indicadores", label: "Indicadores", icon: BarChart3 },
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 lg:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
                GE
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">GestEq</p>
                <p className="text-xs text-slate-500">Equipamentos de Terceiros</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-200 bg-white p-4 pt-20 transition-transform lg:static lg:translate-x-0 lg:border-0 lg:bg-transparent lg:p-0 lg:pt-0",
            open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <nav className="space-y-1">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-w-0 flex-1 pb-24 lg:pb-6"
        >
          {children}
        </motion.main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        {[
          { href: nav[0]?.href ?? "/", label: "Início", icon: LayoutDashboard },
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
                active ? "text-emerald-700" : "text-slate-500"
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
