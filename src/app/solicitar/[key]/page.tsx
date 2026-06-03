"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PublicRequestForm } from "@/components/public/public-request-form";

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
            GE
          </div>
          <div>
            <p className="font-semibold text-slate-900">GestEq — Solicitação por convite</p>
            <p className="text-xs text-slate-500">Acesso autorizado pela Engenharia Clínica</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 p-4 pb-24">
        {isLoading && <p className="p-8 text-center text-slate-500">Validando chave de acesso...</p>}

        {isError && (
          <div className="rounded-xl bg-red-50 px-4 py-6 text-center">
            <p className="font-medium text-red-700">Chave de acesso inválida, revogada ou expirada.</p>
            <p className="mt-2 text-sm text-red-600">
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
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
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
