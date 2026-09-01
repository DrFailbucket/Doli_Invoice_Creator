const DEFAULT_TABLE_WIDTH_MM = 190;
const CORE_COLUMNS = [
  ["line_position", "Pos.", 12, "center", false],
  ["line_description", "Beschreibung", 75, "left", true],
  ["line_quantity", "Menge", 22, "right", false],
  ["line_unit", "Einheit", 22, "center", false],
  ["line_unit_price", "Einzelpreis", 29.5, "right", false],
  ["line_total", "Gesamt", 29.5, "right", false]
];

function createColumn([id, name, widthMm, align, wrap], index, existing = {}) {
  return {
    uid: existing.uid || `col_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`,
    columnClass: "core",
    id,
    name,
    widthMm: Number(existing.widthMm) > 0 ? Number(existing.widthMm) : widthMm,
    align: ["left", "center", "right"].includes(existing.align) ? existing.align : align,
    fontSizePt: Number(existing.fontSizePt) > 0 ? Number(existing.fontSizePt) : 9,
    fontWeight: ["normal", "bold"].includes(existing.fontWeight) ? existing.fontWeight : "normal",
    wrap: typeof existing.wrap === "boolean" ? existing.wrap : wrap
  };
}

export function createDefaultColumns(tableWidthMm = DEFAULT_TABLE_WIDTH_MM) {
  const columns = CORE_COLUMNS.map((definition, index) => createColumn(definition, index));
  const table = { width: tableWidthMm, columns };
  normalizeColumns(table);
  return table.columns;
}

export function createTableElement(index) {
  return { uid: `el_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`, elementClass: "core", id: "invoice_lines", name: "Positionstabelle", type: "table", x: 10, y: 100, width: 190, height: 100, rowMode: "fixed", rowHeightMm: 7, minRowHeightMm: 7, cellPaddingHorizontalMm: 1, cellPaddingVerticalMm: 0, lineHeight: 1.2, verticalAlign: "middle", textOffsetYmm: 0, fontFamily: "Arial", fontSizePt: 9, fontWeight: "normal", color: "#222222", columns: createDefaultColumns() };
}

export function columnXPositions(table) { let x = 0; return table.columns.map((column) => { const position = x; x += Number(column.widthMm) || 0; return position; }); }
export function normalizeColumns(table) { const total = table.columns.reduce((sum, column) => sum + Number(column.widthMm || 0), 0); if (total && Math.abs(total - table.width) > 0.01) table.columns.at(-1).widthMm += table.width - total; }
export function normalizeTableColumns(table) {
  const existingById = new Map((Array.isArray(table.columns) ? table.columns : []).map((column) => [column.id, column]));
  table.columns = CORE_COLUMNS.map((definition, index) => createColumn(definition, index, existingById.get(definition[0])));
  normalizeColumns(table);
}
export function scaleColumns(table, oldWidth, newWidth) { if (!oldWidth || oldWidth === newWidth) return; const ratio = newWidth / oldWidth; table.columns.forEach((column) => { column.widthMm *= ratio; }); normalizeColumns(table); }
export function resizeColumn(table, index, widthMm) { const columns = table.columns; const target = Math.max(3, Number(widthMm)); const delta = target - columns[index].widthMm; const neighborIndex = index === columns.length - 1 ? index - 1 : index + 1; if (!columns[neighborIndex] || columns[neighborIndex].widthMm - delta < 3) return false; columns[index].widthMm = target; columns[neighborIndex].widthMm -= delta; normalizeColumns(table); return true; }
export function validateTable(table) { const errors = []; const warnings = []; const rowHeight = Number(table.rowHeightMm) || 0; const minRowHeight = Number(table.minRowHeightMm) || 0; if (table.width <= 0) errors.push("Tabellenbreite muss größer als 0 sein."); if (table.height <= 0) errors.push("Tabellenhöhe muss größer als 0 sein."); if (table.rowMode === "fixed" && rowHeight <= 0) errors.push("Zeilenhöhe muss größer als 0 sein."); if (table.rowMode === "dynamic" && minRowHeight <= 0) errors.push("Mindesthöhe muss größer als 0 sein."); if ((Number(table.cellPaddingHorizontalMm) || 0) < 0 || (Number(table.cellPaddingVerticalMm) || 0) < 0) errors.push("Zellen-Innenabstand darf nicht negativ sein."); if ((Number(table.lineHeight) || 0) <= 0) errors.push("Line Height muss größer als 0 sein."); if (table.columns.some((column) => column.widthMm < 3)) errors.push("Spaltenbreite darf nicht kleiner als 3 mm sein."); const total = table.columns.reduce((sum, column) => sum + Number(column.widthMm || 0), 0); if (Math.abs(total - table.width) > 0.01) errors.push("Summe der Spaltenbreiten stimmt nicht mit der Tabellenbreite überein."); if (table.x < 0 || table.y < 0 || table.x + table.width > 210 || table.y + table.height > 297) warnings.push("Tabelle liegt teilweise außerhalb der A4-Seite."); if (table.rowMode === "fixed" && table.height < rowHeight) warnings.push("Tabellenhöhe ist kleiner als eine Standardzeile."); return { errors, warnings, maxRows: rowHeight > 0 ? Math.floor(table.height / rowHeight) : 0 }; }

export const TEST_ROWS = [{ line_position: "1", line_description: "Motoröl 5W-30", line_quantity: "5,0", line_unit: "Liter", line_unit_price: "12,90 €", line_total: "64,50 €" }, { line_position: "2", line_description: "Ölfilter", line_quantity: "1", line_unit: "Stück", line_unit_price: "9,90 €", line_total: "9,90 €" }, { line_position: "3", line_description: "Lange Beispielbeschreibung zur Kontrolle von Textbreite und Umbruch", line_quantity: "1", line_unit: "Stück", line_unit_price: "129,00 €", line_total: "129,00 €" }, { line_position: "4", line_description: "Arbeitszeit – Diagnose und Fehlersuche", line_quantity: "2,50", line_unit: "Std.", line_unit_price: "79,00 €", line_total: "197,50 €" }];
