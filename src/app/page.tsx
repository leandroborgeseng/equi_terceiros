import Link from "next/link";
import { Shield, Smartphone, FileCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 font-bold text-white">
            GE
          </div>
          <div>
            <p className="font-semibold text-slate-900">GestEq</p>
            <p className="text-sm text-slate-500">Gestão de equipamentos de terceiros</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/solicitar">
            <Button variant="outline">Solicitar equipamento</Button>
          </Link>
          <Link href="/login">
            <Button>Entrar</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
        <section className="text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <Shield className="h-4 w-4" /> Compliance hospitalar enterprise-ready
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Portal de homologação técnica
            <span className="block text-emerald-600">para Engenharia Clínica</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
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
          <p className="mt-3 text-sm text-slate-500">
            Médicos e empresas podem solicitar sem login — basta preencher e anexar os documentos.
          </p>
        </section>

        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Smartphone, title: "Mobile-first", desc: "Câmera, upload offline e sincronização automática." },
            { icon: FileCheck, title: "Compliance documental", desc: "Checklist ANVISA, TSE, calibração e termos PDF." },
            { icon: Shield, title: "Homologação EC", desc: "Fila de análise, inspeção técnica e etiquetas." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <f.icon className="mb-4 h-8 w-8 text-emerald-600" />
              <h3 className="font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
