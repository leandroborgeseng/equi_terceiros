// Gera ZPL (Zebra Programming Language) para etiqueta ~62x30mm @203dpi.
export function generateLabelZpl(data: {
  status: string;
  equipmentName: string;
  brand: string;
  model: string;
  serialNumber: string;
  internalOs: string;
  sector?: string;
  validUntil?: string;
  restriction?: string;
  consultUrl: string;
}) {
  const statusLabel: Record<string, string> = {
    LIBERADO: "LIBERADO PARA USO",
    LIBERADO_COM_RESTRICAO: "LIBERADO C/ RESTRICAO",
    BLOQUEADO: "BLOQUEADO / INTERDITADO",
    PENDENTE_ANALISE: "PENDENTE DE ANALISE",
  };
  const title = statusLabel[data.status] ?? data.status.replace(/_/g, " ");
  const esc = (s: string) => (s ?? "").replace(/[\^~]/g, " ").slice(0, 40);

  return [
    "^XA",
    "^PW490",
    "^LL240",
    "^CI28",
    "^FO10,10^GB470,220,3^FS",
    "^FO10,10^GB470,46,46^FS",
    `^FO16,20^A0N,30,30^FR^FD${esc(title)}^FS`,
    `^FO16,70^A0N,24,24^FD${esc(data.equipmentName)}^FS`,
    `^FO16,100^A0N,20,20^FD${esc(`${data.brand} ${data.model}`)}^FS`,
    `^FO16,126^A0N,20,20^FDSerie: ${esc(data.serialNumber)}^FS`,
    `^FO16,152^A0N,20,20^FDOS: ${esc(data.internalOs)}^FS`,
    `^FO16,178^A0N,18,18^FDSetor: ${esc(data.sector ?? "-")}^FS`,
    data.validUntil ? `^FO16,200^A0N,18,18^FDValidade: ${esc(data.validUntil)}^FS` : "",
    data.restriction ? `^FO16,222^A0N,16,16^FDRestr.: ${esc(data.restriction)}^FS` : "",
    `^FO330,80^BQN,2,5^FDQA,${data.consultUrl}^FS`,
    "^XZ",
  ]
    .filter(Boolean)
    .join("\n");
}
