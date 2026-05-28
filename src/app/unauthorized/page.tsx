import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Acesso não autorizado</h1>
      <p className="text-slate-500">Seu perfil não tem permissão para esta área.</p>
      <Link href="/"><Button>Voltar</Button></Link>
    </div>
  );
}
