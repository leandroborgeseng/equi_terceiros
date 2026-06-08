import Link from "next/link";
import { Shield, Smartphone, FileCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GestEqLogo } from "@/components/gesteq/logo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <GestEqLogo size={44} />
        <div className="flex items-center gap-2">
          <Link href="/solicitar">
            <Button variant="outline">Solicitar equipamento</Button>
          </Link>
          <Link href="/login">
            <Button>Entrar</Button>
          </Link>
        </div>
      </header>

      <main className="gesteq-rise mx-auto max-w-6xl px-6 pb-20 pt-8">
        <section className="text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-4 py-1.5 text-sm font-medium text-[var(--brand-ink)]">
            <Shield className="h-4 w-4" /> Compliance hospitalar enterprise-ready
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl">
            Portal de homologação técnica
            <span className="block text-[var(--brand)]">para Engenharia Clínica</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--ink-2)]">
            Médicos e fornecedores preenchem. A Engenharia Clínica valida, homologa e libera.
            Mobile-first, PWA instalável e rastreabilidade completa.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/solicitar">
              <Button size="lg">
                Solicitar cadastro de equipamento <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Acessar plataforma (Engenharia Clínica)
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Médicos e empresas podem solicitar sem login — basta preencher e anexar os documentos.
          </p>
        </section>

        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Smartphone, title: "Mobile-first", desc: "Câmera, upload offline e sincronização automática." },
            { icon: FileCheck, title: "Compliance documental", desc: "Checklist ANVISA, TSE, calibração e termos PDF." },
            { icon: Shield, title: "Homologação EC", desc: "Fila de análise, inspeção técnica e etiquetas." },
          ].map((f) => (
            <div key={f.title} className="gesteq-card p-6">
              <f.icon className="mb-4 h-8 w-8 text-[var(--brand)]" />
              <h3 className="font-display font-semibold text-[var(--ink)]">{f.title}</h3>
              <p className="mt-2 text-sm text-[var(--ink-2)]">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
