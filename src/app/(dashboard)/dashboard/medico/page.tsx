"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestCard, type RequestCardData } from "@/components/requests/request-card";
import { PageHeader } from "@/components/gesteq/page-header";

export default function MedicoDashboardPage() {
  const { data: requests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: () => fetch("/api/requests").then((r) => r.json()),
  });

  return (
    <div className="gesteq-rise space-y-6">
      <PageHeader
        eyebrow="Médico solicitante"
        title="Minhas solicitações"
        subtitle="Crie e acompanhe pedidos de equipamentos de terceiros"
        actions={
          <Link href="/dashboard/medico/nova">
            <Button>
              <Plus className="h-4 w-4" /> Nova solicitação
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {(requests as RequestCardData[]).map((r) => (
          <RequestCard
            key={r.id}
            request={{ ...r, doctor: r.doctor ?? { name: "—" }, plannedDate: String(r.plannedDate) }}
            href={`/dashboard/medico/solicitacoes/${r.id}`}
          />
        ))}
        {requests.length === 0 && (
          <p className="col-span-2 py-12 text-center text-[var(--muted)]">
            Nenhuma solicitação ainda. Crie a primeira!
          </p>
        )}
      </div>
    </div>
  );
}
