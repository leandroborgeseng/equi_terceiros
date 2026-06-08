import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, Printer, Tags, KeyRound } from "lucide-react";
import { PageHeader } from "@/components/gesteq/page-header";

const sections = [
  {
    href: "/configuracoes/usuarios",
    title: "Usuários",
    desc: "Criar, editar perfis e ativar/desativar acessos",
    icon: Users,
    enabled: true,
  },
  {
    href: "/convites",
    title: "Chaves de acesso",
    desc: "Gerar links para médico/empresa solicitar sem login",
    icon: KeyRound,
    enabled: true,
  },
  {
    href: "/configuracoes/setores",
    title: "Setores",
    desc: "Cadastro de setores assistenciais usados nos formulários",
    icon: Building2,
    enabled: true,
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
    <div className="gesteq-rise space-y-6">
      <PageHeader
        eyebrow="Administração"
        title="Configurações"
        subtitle="Administração do sistema GestEq"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => {
          const content = (
            <Card className={s.enabled ? "transition-shadow hover:shadow-[var(--shadow)]" : "opacity-60"}>
              <CardContent className="flex items-start gap-4 p-5">
                <div className="rounded-[var(--r-lg)] bg-[var(--brand-soft)] p-3">
                  <s.icon className="h-6 w-6 text-[var(--brand-ink)]" />
                </div>
                <div>
                  <p className="font-display font-semibold text-[var(--ink)]">{s.title}</p>
                  <p className="text-sm text-[var(--muted)]">{s.desc}</p>
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
