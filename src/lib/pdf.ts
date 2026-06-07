import { jsPDF } from "jspdf";
import { LABEL_HEIGHT_MM, LABEL_WIDTH_MM } from "@/lib/label-layout";

export type LabelPdfData = {
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
  qrDataUrl?: string;
};

const STATUS_COLORS: Record<string, [number, number, number]> = {
  PENDENTE_ANALISE: [234, 179, 8],
  LIBERADO: [34, 197, 94],
  LIBERADO_COM_RESTRICAO: [249, 115, 22],
  BLOQUEADO: [239, 68, 68],
};

/** Desenha uma etiqueta 90×50 mm com canto superior-esquerdo em (offsetX, offsetY). */
export function drawLabelOnPdf(doc: jsPDF, offsetX: number, offsetY: number, data: LabelPdfData) {
  const w = LABEL_WIDTH_MM;
  const h = LABEL_HEIGHT_MM;
  const color = STATUS_COLORS[data.status] ?? [100, 100, 100];

  doc.setFillColor(...color);
  doc.rect(offsetX, offsetY, w, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(data.status.replace(/_/g, " "), offsetX + 5, offsetY + 8);

  const hasQr = !!data.qrDataUrl;
  const qrSize = 24;
  const qrX = offsetX + w - qrSize - 3;
  const qrY = offsetY + 15;
  if (hasQr) {
    doc.addImage(data.qrDataUrl!, "PNG", qrX, qrY, qrSize, qrSize);
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(5);
    doc.text("Aponte a câmera", qrX + qrSize / 2, qrY + qrSize + 2.5, { align: "center" });
  }

  const textWidth = hasQr ? qrX - offsetX - 7 : w - 10;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.text(`OS: ${data.protocol}`, offsetX + 5, offsetY + 18);
  doc.text(`${data.equipmentName} — ${data.brand} ${data.model}`, offsetX + 5, offsetY + 24, {
    maxWidth: textWidth,
  });
  doc.text(`S/N: ${data.serialNumber}`, offsetX + 5, offsetY + 32);
  doc.text(`Setor: ${data.sector ?? "—"}`, offsetX + 5, offsetY + 38, { maxWidth: textWidth });
  doc.text(`${data.date}`, offsetX + 5, offsetY + 44);
  if (data.validUntil) doc.text(`Validade: ${data.validUntil}`, offsetX + 28, offsetY + 44);
  if (data.restriction) {
    doc.text(`Restrição: ${data.restriction}`, offsetX + 5, offsetY + 48, { maxWidth: textWidth });
  }
  if (data.blockReason) {
    doc.text(`Bloqueio: ${data.blockReason}`, offsetX + 5, offsetY + 48, { maxWidth: textWidth });
  }
  if (data.technicalLead && !hasQr) {
    doc.text(`RT: ${data.technicalLead}`, offsetX + 60, offsetY + 44);
  }

  // Guia de corte (útil na folha A4)
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.15);
  doc.rect(offsetX, offsetY, w, h, "S");
}

/** Uma etiqueta isolada (90×50 mm) — impressora de etiquetas ou corte manual. */
export function generateLabelPdf(data: LabelPdfData) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [LABEL_WIDTH_MM, LABEL_HEIGHT_MM],
  });
  drawLabelOnPdf(doc, 0, 0, data);
  return doc.output("arraybuffer");
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_MARGIN_MM = 8;

/** Várias etiquetas em folhas A4 (2 colunas × 5 linhas = 10 por página). */
export function generateLabelsA4Pdf(labels: LabelPdfData[]) {
  const cols = Math.floor((A4_WIDTH_MM - 2 * A4_MARGIN_MM) / LABEL_WIDTH_MM);
  const rows = Math.floor((A4_HEIGHT_MM - 2 * A4_MARGIN_MM) / LABEL_HEIGHT_MM);
  const perPage = cols * rows;
  const gridW = cols * LABEL_WIDTH_MM;
  const gridH = rows * LABEL_HEIGHT_MM;
  const startX = (A4_WIDTH_MM - gridW) / 2;
  const startY = A4_MARGIN_MM;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  labels.forEach((label, index) => {
    if (index > 0 && index % perPage === 0) doc.addPage();
    const pageIndex = index % perPage;
    const col = pageIndex % cols;
    const row = Math.floor(pageIndex / cols);
    const x = startX + col * LABEL_WIDTH_MM;
    const y = startY + row * LABEL_HEIGHT_MM;
    drawLabelOnPdf(doc, x, y, label);
  });

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
    `Empresa (PJ): ${data.supplierName}`,
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
    "2. A empresa (PJ) declara responsabilidade pela documentação e conformidade.",
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
