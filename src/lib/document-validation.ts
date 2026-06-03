import type { AiValidationStatus } from "@/lib/enums";

export type ValidationInput = {
  requestSerialNumber: string;
  requestBrand: string;
  requestModel: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  photoType?: string;
};

export type ValidationResult = {
  status: AiValidationStatus;
  extractedText?: string;
  serialDetected?: string;
  manufacturerDetected?: string;
  modelDetected?: string;
  messages: string[];
};

/** Validação automática MVP — regras; preparado para OCR/IA futura */
export function validateUpload(input: ValidationInput): ValidationResult {
  const messages: string[] = [];
  let status: AiValidationStatus = "VALIDATED";

  const name = input.fileName.toLowerCase();
  const serial = input.requestSerialNumber.toLowerCase();

  if (input.photoType === "NUMERO_SERIE" && !name.includes("serie") && !name.includes("serial")) {
    messages.push("Nome do arquivo sugere revisar foto do número de série");
  }

  if (input.documentType === "ANVISA" && !name.includes("anvisa") && !name.includes("registro")) {
    messages.push("Documento ANVISA: confirme o arquivo correto");
    status = "MANUAL_REVIEW";
  }

  if (input.photoType === "NUMERO_SERIE" && serial.length > 3) {
    if (name.replace(/[^a-z0-9]/g, "").includes(serial.replace(/[^a-z0-9]/g, "").slice(0, 6))) {
      messages.push("Possível correspondência série/arquivo");
    } else {
      messages.push("Verificar se o número de série na foto confere com a solicitação");
      status = "MANUAL_REVIEW";
    }
  }

  if (input.mimeType === "application/pdf" && input.fileName.length < 5) {
    status = "MANUAL_REVIEW";
    messages.push("PDF com nome inválido");
  }

  return {
    status,
    extractedText: `auto:${input.fileName}`,
    serialDetected: input.photoType === "NUMERO_SERIE" ? input.requestSerialNumber : undefined,
    manufacturerDetected: input.requestBrand,
    modelDetected: input.requestModel,
    messages,
  };
}
