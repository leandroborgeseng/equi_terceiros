import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, Printer, Tags } from "lucide-react";

const sections = [
  {
    href: "/configuracoes/usuarios",
    title: "Usuários",
    desc: "Criar, editar perfis e ativar/desativar acessos",
    icon: Users,
    enabled: true,
  },
  {
    href: "/configuracoes",
    title: "Setores",
    desc: "Cadastro de setores assistenciais (em breve)",
    icon: Building2,
    enabled: false,
  },
  {
    href: "/configuracoes",
    title: "Impressoras Bluetooth",
    desc: "Pareamento de impressoras de etiqueta (Fase 2)",
    icon: Printer,
    enabled: false,
  },
  {
    href: "/configuracoes",
    title: "Templates de etiqueta",
    desc: "Modelos ZPL e layout das etiquetas (Fase 2)",
    icon: Tags,
    enabled: false,
  },
];

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500">Administração do sistema GestEq</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => {
          const content = (
            <Card className={s.enabled ? "transition-shadow hover:shadow-md" : "opacity-60"}>
              <CardContent className="flex items-start gap-4 p-5">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <s.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{s.title}</p>
                  <p className="text-sm text-slate-500">{s.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
          return s.enabled ? (
            <Link key={s.title} href={s.href}>
              {content}
            </Link>
          ) : (
            <div key={s.title}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
