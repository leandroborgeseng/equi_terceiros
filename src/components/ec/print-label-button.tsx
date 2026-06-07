"use client";

import { useState } from "react";
import { Printer, Bluetooth, Loader2 } from "lucide-react";
import { generateLabelZpl } from "@/lib/zpl";

// Web Bluetooth API mínima (não tipada por padrão no TS DOM)
type BTChar = { writeValue: (v: BufferSource) => Promise<void> };
type BTDevice = {
  gatt?: {
    connect: () => Promise<{
      getPrimaryService: (s: string) => Promise<{ getCharacteristic: (c: string) => Promise<BTChar> }>;
    }>;
  };
};
type BTNavigator = Navigator & {
  bluetooth?: {
    requestDevice: (opts: unknown) => Promise<BTDevice>;
  };
};

// Serviço/característica padrão de impressoras seriais Bluetooth (Zebra e similares)
const PRINT_SERVICE = "000018f0-0000-1000-8000-00805f9b34fb";
const PRINT_CHAR = "00002af1-0000-1000-8000-00805f9b34fb";

export function PrintLabelButton({
  requestId,
  qrToken,
  status,
  equipmentName,
  brand,
  model,
  serialNumber,
  internalOs,
  sector,
  validUntil,
  restriction,
}: {
  requestId: string;
  qrToken?: string | null;
  status: string;
  equipmentName: string;
  brand: string;
  model: string;
  serialNumber: string;
  internalOs: string;
  sector?: string;
  validUntil?: string;
  restriction?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function openPdf() {
    window.open(`/api/labels/${requestId}`, "_blank");
  }

  async function printBluetooth() {
    setMsg(null);
    const nav = navigator as BTNavigator;
    if (!nav.bluetooth) {
      setMsg("Bluetooth não suportado neste dispositivo — abrindo PDF.");
      openPdf();
      return;
    }

    setBusy(true);
    try {
      const consultUrl = qrToken ? `${window.location.origin}/equipamento/${qrToken}` : window.location.origin;
      const zpl = generateLabelZpl({
        status,
        equipmentName,
        brand,
        model,
        serialNumber,
        internalOs,
        sector,
        validUntil,
        restriction,
        consultUrl,
      });

      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: [PRINT_SERVICE] }],
        optionalServices: [PRINT_SERVICE],
      });
      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService(PRINT_SERVICE);
      const characteristic = await service.getCharacteristic(PRINT_CHAR);

      // envia em blocos de 180 bytes (limite BLE)
      const bytes = new TextEncoder().encode(zpl);
      const chunk = 180;
      for (let i = 0; i < bytes.length; i += chunk) {
        await characteristic.writeValue(bytes.slice(i, i + chunk));
      }
      setMsg("Etiqueta enviada para a impressora.");
    } catch (e) {
      const err = e instanceof Error ? e.message : "";
      // usuário cancelou a seleção: não força fallback
      if (/cancel|user/i.test(err)) {
        setMsg(null);
      } else {
        setMsg("Falha no Bluetooth — abrindo PDF para impressão manual.");
        openPdf();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={printBluetooth}
        disabled={busy}
        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bluetooth className="h-4 w-4" />}
        Imprimir etiqueta (Bluetooth)
      </button>
      <button
        type="button"
        onClick={openPdf}
        className="flex items-center gap-1 text-sm text-emerald-600 hover:underline"
      >
        <Printer className="h-4 w-4" /> Baixar etiqueta (PDF)
      </button>
      {msg && <span className="text-xs text-slate-500">{msg}</span>}
    </div>
  );
}
