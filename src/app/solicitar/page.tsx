import { PublicRequestForm } from "@/components/public/public-request-form";

export default function SolicitarPublicPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
            GE
          </div>
          <div>
            <p className="font-semibold text-slate-900">GestEq — Solicitação de equipamento</p>
            <p className="text-xs text-slate-500">Médico ou empresa · sem necessidade de login</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 p-4 pb-24">
        <PublicRequestForm />
      </main>
    </div>
  );
}
