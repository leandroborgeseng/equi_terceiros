import { PublicRequestForm } from "@/components/public/public-request-form";
import { GestEqLogo } from "@/components/gesteq/logo";

export default function SolicitarPublicPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface)] px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <GestEqLogo size={36} />
          <div>
            <p className="font-display font-semibold text-[var(--ink)]">Solicitação de equipamento</p>
            <p className="text-xs text-[var(--muted)]">Médico ou empresa · sem necessidade de login</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 p-4 pb-24">
        <PublicRequestForm />
      </main>
    </div>
  );
}
