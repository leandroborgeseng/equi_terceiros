import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GestEqLogo } from "@/components/gesteq/logo";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--surface)] p-4">
      <GestEqLogo size={48} />
      <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Acesso não autorizado</h1>
      <p className="text-[var(--muted)]">Seu perfil não tem permissão para esta área.</p>
      <Link href="/">
        <Button>Voltar</Button>
      </Link>
    </div>
  );
}
