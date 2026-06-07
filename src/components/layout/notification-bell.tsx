"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Alert = {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  dueDate?: string | null;
  request?: { protocol: string; equipmentName: string } | null;
  requestId?: string | null;
};

const severityColor: Record<string, string> = {
  URGENT_VENCIDO: "bg-red-500",
  URGENT_7_DIAS: "bg-orange-500",
  WARNING_15_DIAS: "bg-amber-500",
  INFO_30_DIAS: "bg-blue-500",
};

export function NotificationBell() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: () => fetch("/api/alerts").then((r) => (r.ok ? r.json() : [])),
    refetchInterval: 60_000,
  });

  const resolve = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: true }),
      });
      if (!res.ok) throw new Error("Erro");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const count = alerts.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
        aria-label="Notificações"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Notificações</p>
              <button onClick={() => setOpen(false)} aria-label="Fechar">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {count === 0 && (
                <p className="px-4 py-8 text-center text-sm text-slate-500">
                  Nenhum alerta pendente.
                </p>
              )}
              {alerts.map((a) => (
                <div key={a.id} className="flex gap-2 border-b border-slate-50 px-4 py-3 last:border-0">
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      severityColor[a.severity] ?? "bg-slate-400"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">{a.title}</p>
                    <p className="text-xs text-slate-500">{a.message}</p>
                    {a.requestId && (
                      <Link
                        href={`/dashboard/engenharia/solicitacoes/${a.requestId}`}
                        onClick={() => setOpen(false)}
                        className="text-xs text-emerald-600 hover:underline"
                      >
                        {a.request?.equipmentName ?? "Ver solicitação"}
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={() => resolve.mutate(a.id)}
                    disabled={resolve.isPending}
                    className="shrink-0 self-start rounded-md p-1 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                    aria-label="Resolver"
                    title="Marcar como resolvido"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
