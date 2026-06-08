"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PublicRequestForm } from "@/components/public/public-request-form";
import { GestEqLogo } from "@/components/gesteq/logo";

export default function SolicitarComChavePage() {
  const { key } = useParams<{ key: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["invite", key],
    queryFn: () =>
      fetch(`/api/public/invite/${key}`).then((r) => {
        if (!r.ok) throw new Error("Chave inválida");
        return r.json();
      }),
    retry: false,
  });

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface)] px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <GestEqLogo size={36} />
          <div>
            <p className="font-display font-semibold text-[var(--ink)]">Solicitação por convite</p>
            <p className="text-xs text-[var(--muted)]">Acesso autorizado pela Engenharia Clínica</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 p-4 pb-24">
        {isLoading && <p className="p-8 text-center text-[var(--muted)]">Validando chave de acesso...</p>}

        {isError && (
          <div className="rounded-[var(--r-lg)] border border-[color-mix(in_oklch,var(--bloqueado)_30%,transparent)] bg-[var(--bloqueado-soft)] px-4 py-6 text-center">
            <p className="font-medium text-[var(--bloqueado-ink)]">
              Chave de acesso inválida, revogada ou expirada.
            </p>
            <p className="mt-2 text-sm text-[var(--bloqueado-ink)]">
              Solicite uma nova chave à Engenharia Clínica ou{" "}
              <Link href="/solicitar" className="underline">
                use o formulário aberto
              </Link>
              .
            </p>
          </div>
        )}

        {data?.valid && (
          <>
            <div className="rounded-[var(--r-lg)] border border-[var(--brand-line)] bg-[var(--brand-soft)] px-4 py-3 text-sm text-[var(--brand-ink)]">
              Convite válido para <strong>{data.requesterName}</strong>. Confira os dados e preencha a
              solicitação.
            </div>
            <PublicRequestForm
              inviteKey={key}
              prefill={{
                requesterName: data.requesterName,
                requesterEmail: data.requesterEmail,
                requesterPhone: data.requesterPhone,
                doctorCrm: data.doctorCrm,
                entryType: data.entryType,
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}
