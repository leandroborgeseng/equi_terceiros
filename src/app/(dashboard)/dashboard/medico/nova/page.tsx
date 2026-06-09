import { MedicalRequestWizard } from "@/components/requests/medical-wizard";
import { PageHeader } from "@/components/gesteq/page-header";

export default function NovaSolicitacaoPage() {
  return (
    <div className="gesteq-rise mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Médico"
        title="Nova solicitação"
        subtitle="Cadastro de equipamento de terceiro para homologação pela Engenharia Clínica"
      />
      <MedicalRequestWizard />
    </div>
  );
}
