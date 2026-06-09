"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, Loader2, UserRound } from "lucide-react";
import type { UserRole } from "@/lib/enums";
import { ALL_ROLES, ROLE_LABELS, ROLE_ROUTES, canImpersonate } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export function ImpersonationPanel({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState<UserRole | null>(null);

  const user = session?.user;
  const realRole = (user?.realRole ?? user?.role) as UserRole | undefined;

  if (!user || !realRole || !canImpersonate(realRole)) return null;

  async function switchRole(role: UserRole) {
    if (!user || loading) return;
    if (role === user.role && !user.impersonating) return;
    if (role === realRole && !user.impersonating) return;

    setLoading(role);
    try {
      if (role === realRole && user.impersonating) {
        await update({ stopImpersonate: true });
        router.push(ROLE_ROUTES[realRole]);
        router.refresh();
        return;
      }

      const res = await fetch("/api/dev/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Falha ao personificar");
      const { user: target } = await res.json();
      await update({ impersonate: target });
      router.push(ROLE_ROUTES[role as UserRole]);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className={cn(
        "rounded-[var(--r-lg)] border border-[color-mix(in_oklch,var(--brand)_22%,transparent)] bg-[var(--brand-soft)]",
        compact ? "p-2" : "p-3"
      )}
    >
      <div className={cn("flex items-center gap-2", compact ? "mb-2 justify-center" : "mb-2.5")}>
        <Eye className="h-3.5 w-3.5 shrink-0 text-[var(--brand-ink)]" />
        {!compact && (
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[var(--brand-ink)]">Personificar perfil</p>
            <p className="text-[10px] text-[var(--muted)]">Testar visão de cada usuário</p>
          </div>
        )}
      </div>

      <div className={cn("flex flex-col gap-1", compact && "items-center")}>
        {ALL_ROLES.map((role) => {
          const active = user.role === role;
          const isRealAdmin = role === realRole && !user.impersonating;
          return (
            <button
              key={role}
              type="button"
              title={ROLE_LABELS[role]}
              disabled={!!loading}
              onClick={() => switchRole(role)}
              className={cn(
                "flex w-full items-center gap-2 rounded-[var(--r-sm)] px-2 py-1.5 text-left text-[11.5px] font-medium transition-colors",
                compact && "w-10 justify-center px-0",
                active
                  ? "bg-[var(--brand)] text-white"
                  : "text-[var(--ink-2)] hover:bg-[var(--surface)]"
              )}
            >
              {loading === role ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
              ) : (
                <UserRound className="h-3.5 w-3.5 shrink-0 opacity-80" />
              )}
              {!compact && (
                <span className="truncate">
                  {ROLE_LABELS[role]}
                  {isRealAdmin && " · você"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {user.impersonating && !compact && (
        <p className="mt-2 text-[10px] leading-snug text-[var(--brand-ink)]">
          Visualizando como <strong>{ROLE_LABELS[user.role]}</strong>. Clique em Administrador para voltar.
        </p>
      )}
    </div>
  );
}
