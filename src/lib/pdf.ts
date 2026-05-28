import { jsPDF } from "jspdf";

export function generateLabelPdf(data: {
  protocol: string;
  status: string;
  date: string;
  validUntil?: string;
  sector?: string;
  restriction?: string;
  blockReason?: string;
  technicalLead?: string;
  equipmentName: string;
  brand: string;
  model: string;
  serialNumber: string;
}) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [90, 50] });
  const statusColors: Record<string, [number, number, number]> = {
    PENDENTE_ANALISE: [234, 179, 8],
    LIBERADO: [34, 197, 94],
    LIBERADO_COM_RESTRICAO: [249, 115, 22],
    BLOQUEADO: [239, 68, 68],
  };
  const color = statusColors[data.status] ?? [100, 100, 100];
  doc.setFillColor(...color);
  doc.rect(0, 0, 90, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(data.status.replace(/_/g, " "), 5, 8);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.text(`OS: ${data.protocol}`, 5, 18);
  doc.text(`${data.equipmentName} — ${data.brand} ${data.model}`, 5, 24);
  doc.text(`S/N: ${data.serialNumber}`, 5, 30);
  doc.text(`Setor: ${data.sector ?? "—"} | ${data.date}`, 5, 36);
  if (data.validUntil) doc.text(`Validade: ${data.validUntil}`, 5, 42);
  if (data.restriction) doc.text(`Restrição: ${data.restriction}`, 5, 46);
  if (data.blockReason) doc.text(`Bloqueio: ${data.blockReason}`, 5, 46);
  if (data.technicalLead) doc.text(`RT: ${data.technicalLead}`, 60, 42);
  return doc.output("arraybuffer");
}

export function generateTermPdf(data: {
  protocol: string;
  doctorName: string;
  doctorCrm: string;
  supplierName: string;
  ownerName: string;
  equipmentName: string;
  brand: string;
  model: string;
  serialNumber: string;
  anvisaNumber?: string;
  plannedProcedure: string;
  plannedDate: string;
}) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("TERMO DE RESPONSABILIDADE", 105, 20, { align: "center" });
  doc.setFontSize(10);
  const lines = [
    `Protocolo: ${data.protocol}`,
    "",
    "RESPONSÁVEIS",
    `Médico solicitante: ${data.doctorName} — CRM ${data.doctorCrm}`,
    `Fornecedor: ${data.supplierName}`,
    `Proprietário: ${data.ownerName}`,
    "",
    "EQUIPAMENTO",
    `${data.equipmentName} — ${data.brand} ${data.model}`,
    `Nº de série: ${data.serialNumber}`,
    data.anvisaNumber ? `Registro ANVISA: ${data.anvisaNumber}` : "",
    `Procedimento: ${data.plannedProcedure}`,
    `Data prevista: ${data.plannedDate}`,
    "",
    "DECLARAÇÕES",
    "1. O médico declara necessidade clínica e ausência de alternativa institucional.",
    "2. O fornecedor/proprietário declara responsabilidade pela documentação e conformidade.",
    "3. A Engenharia Clínica atua exclusivamente na homologação técnica.",
    "",
    "ACEITE ELETRÔNICO",
    "Assinatura digital preparada para validação futura.",
  ].filter(Boolean);

  let y = 35;
  for (const line of lines) {
    doc.text(line, 20, y, { maxWidth: 170 });
    y += line === "" ? 4 : 7;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }
  return doc.output("arraybuffer");
}
