import type { AiValidationStatus } from "@/lib/enums";

export interface OcrInput {
  storageKey: string;
  fileName: string;
  mimeType: string;
  photoType?: string | null;
  // Contexto da solicitação para conferência automática
  expectedSerial?: string | null;
  expectedBrand?: string | null;
  expectedModel?: string | null;
  expectedAnvisa?: string | null;
}

export interface OcrResult {
  imageType: string;
  extractedText?: string;
  serialDetected?: string;
  manufacturerDetected?: string;
  modelDetected?: string;
  anvisaDetected?: string;
  aiValidationStatus: AiValidationStatus;
  confidence: number;
  messages: string[];
}

/**
 * Pipeline de OCR/IA — ESTRUTURA PREPARADA.
 *
 * Hoje retorna uma extração heurística (nome de arquivo + contexto da solicitação),
 * mantendo o contrato pronto para plugar um provedor real:
 *   - OCR: Tesseract.js (client) ou Google Cloud Vision / AWS Textract (server)
 *   - IA de validação: LLM/visão para conferir série, ANVISA e tipo de documento
 *
 * Basta substituir o corpo de `runOcrProvider` mantendo o retorno `OcrResult`.
 */
export async function processImageOcr(input: OcrInput): Promise<OcrResult> {
  return runOcrProvider(input);
}

async function runOcrProvider(input: OcrInput): Promise<OcrResult> {
  const messages: string[] = [];
  const name = input.fileName.toLowerCase();
  const norm = (v?: string | null) => (v ?? "").replace(/[^a-z0-9]/gi, "").toLowerCase();

  let status: AiValidationStatus = "PROCESSING";
  let confidence = 0.4;

  const serialDetected =
    input.photoType === "NUMERO_SERIE" || input.photoType === "ETIQUETA_FABRICANTE"
      ? input.expectedSerial ?? undefined
      : undefined;

  // Conferência heurística série x foto
  if (serialDetected && norm(name).includes(norm(serialDetected).slice(0, 6))) {
    messages.push("Número de série confere com a solicitação");
    confidence = 0.85;
    status = "VALIDATED";
  } else if (input.photoType === "NUMERO_SERIE") {
    messages.push("Número de série requer conferência manual");
    status = "MANUAL_REVIEW";
  }

  const anvisaDetected =
    name.includes("anvisa") || name.includes("registro") ? input.expectedAnvisa ?? undefined : undefined;
  if (anvisaDetected) {
    messages.push("Possível registro ANVISA identificado");
  }

  return {
    imageType: input.photoType ?? "OUTROS",
    extractedText: `ocr:${input.fileName}`,
    serialDetected,
    manufacturerDetected: input.expectedBrand ?? undefined,
    modelDetected: input.expectedModel ?? undefined,
    anvisaDetected,
    aiValidationStatus: status,
    confidence,
    messages,
  };
}
