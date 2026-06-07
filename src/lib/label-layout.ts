export const LABEL_WIDTH_MM = 90;
export const LABEL_HEIGHT_MM = 50;

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_MARGIN_MM = 8;

export function labelsPerA4Page() {
  const cols = Math.floor((A4_WIDTH_MM - 2 * A4_MARGIN_MM) / LABEL_WIDTH_MM);
  const rows = Math.floor((A4_HEIGHT_MM - 2 * A4_MARGIN_MM) / LABEL_HEIGHT_MM);
  return cols * rows;
}
