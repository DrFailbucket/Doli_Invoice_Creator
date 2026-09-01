import { measureTextBlock } from "./textMeasure.js";

export function tableRowsFromValues(table, rows) {
  return rows.map((row, index) => {
    const values = row?.values || row;
    return { index: row?.sourceIndex ?? row?.index ?? index, values, cells: table.columns.map((column) => ({ columnId: column.id, value: values[column.id] ?? "" })) };
  });
}

export function layoutTableRows(table, rows) {
  const prepared = tableRowsFromValues(table, rows);
  let cursor = 0;
  let acceptingRows = true;
  const fittedRows = [];
  const overflowRows = [];
  const rowResults = prepared.map((row) => {
    const measurements = row.cells.map((cell, columnIndex) => { const column = table.columns[columnIndex]; return { ...measureTextBlock({ text: cell.value, widthMm: column.widthMm, fontFamily: table.fontFamily, fontSizePt: column.fontSizePt || table.fontSizePt, fontWeight: column.fontWeight || table.fontWeight, wrap: column.wrap, lineHeight: table.lineHeight, paddingHorizontalMm: table.cellPaddingHorizontalMm, paddingVerticalMm: table.cellPaddingVerticalMm }), columnId: column.id }; });
    const requiredContentHeightMm = Math.max(...measurements.map((measurement) => measurement.heightMm), 0);
    const rowHeightMm = Math.max(0.1, Number(table.rowHeightMm) || 7);
    const minRowHeightMm = Math.max(0.1, Number(table.minRowHeightMm) || rowHeightMm);
    const slotCount = table.rowMode === "fixed" ? Math.max(1, Math.ceil(requiredContentHeightMm / rowHeightMm)) : 1;
    const heightMm = table.rowMode === "fixed" ? slotCount * rowHeightMm : Math.max(requiredContentHeightMm, minRowHeightMm);
    const horizontalOverflow = measurements.some((measurement) => measurement.horizontalOverflow);
    const fits = acceptingRows && cursor + heightMm <= table.height + 0.01;
    const result = { ...row, yMm: cursor, heightMm, slotCount, fits, oversized: heightMm > table.height + 0.01, horizontalOverflow, measurements };
    (fits ? fittedRows : overflowRows).push(result);
    if (!fits) acceptingRows = false;
    cursor += heightMm;
    return result;
  });
  const usedHeightMm = fittedRows.reduce((sum, row) => sum + row.heightMm, 0);
  return {
    rows: rowResults,
    fittedRows,
    overflowRows,
    usedHeightMm,
    remainingHeightMm: Math.max(0, table.height - usedHeightMm),
    oversized: rowResults.some((row) => row.oversized),
    oversizedRows: rowResults.filter((row) => row.oversized),
    hasHorizontalOverflow: rowResults.some((row) => row.horizontalOverflow),
    multiSlotRows: rowResults.filter((row) => table.rowMode === "fixed" && row.slotCount > 1)
  };
}
