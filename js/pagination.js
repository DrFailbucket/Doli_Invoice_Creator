import { TEMPLATE_LABELS, TEMPLATE_TYPES } from "./state.js";
import { layoutTableRows } from "./rowLayout.js";

const MULTI_TEMPLATE_ERRORS = {
  first: "Mehrseitige Hauptseite ist nicht vollständig eingerichtet.",
  middle: "Mehrseitige Mittelseite ist nicht vollständig eingerichtet.",
  last: "Mehrseitige Endseite ist nicht vollständig eingerichtet."
};

function findInvoiceTable(project, templateType) {
  return project.templates?.[templateType]?.elements?.find((element) => element.type === "table" && element.id === "invoice_lines") || null;
}

function sourceRows(rows) {
  return rows.map((row, index) => ({ sourceIndex: index, values: row?.values || row }));
}

function rawRows(rows) {
  return rows.map((row) => ({ sourceIndex: row.index, values: row.values }));
}

function pageResult(pageNumber, template, rows) {
  return { pageNumber, template, label: TEMPLATE_LABELS[template], rows: rawRows(rows) };
}

function missingTemplate(template) {
  return { success: false, error: "MISSING_TEMPLATE", template, message: MULTI_TEMPLATE_ERRORS[template] || `${TEMPLATE_LABELS[template] || template} ist nicht vollständig eingerichtet.` };
}

function rowTooLarge(row, template) {
  return { success: false, error: "ROW_TOO_LARGE", template, rowIndex: row.index, message: `Position ${row.index + 1} ist höher als der verfügbare Tabellenbereich.` };
}

function validateTableResult(layout, template) {
  const oversized = layout.oversizedRows[0];
  if (oversized) return rowTooLarge(oversized, template);
  return null;
}

export function validatePaginationTemplates(project) {
  const result = {};
  TEMPLATE_TYPES.forEach((type) => { result[type] = Boolean(findInvoiceTable(project, type)); });
  return result;
}

export function paginateInvoiceRows(project, rows, options = {}) {
  const maxPages = options.maxPages || 100;
  const allRows = sourceRows(rows);
  const singleTable = findInvoiceTable(project, "single");

  if (singleTable) {
    const singleLayout = layoutTableRows(singleTable, allRows);
    const singleError = validateTableResult(singleLayout, "single");
    if (singleError) return singleError;
    if (singleLayout.overflowRows.length === 0) {
      return { success: true, pages: [pageResult(1, "single", singleLayout.fittedRows)], totalPages: 1 };
    }
  }

  const firstTable = findInvoiceTable(project, "first");
  if (!firstTable) return missingTemplate("first");
  const lastTable = findInvoiceTable(project, "last");
  if (!lastTable) return missingTemplate("last");

  const pages = [];
  let remainingRows = allRows;
  let pageNumber = 1;

  const firstLayout = layoutTableRows(firstTable, remainingRows);
  const firstError = validateTableResult(firstLayout, "first");
  if (firstError) return firstError;
  if (!firstLayout.fittedRows.length && remainingRows.length) return rowTooLarge(firstLayout.rows[0], "first");
  pages.push(pageResult(pageNumber++, "first", firstLayout.fittedRows));
  remainingRows = firstLayout.overflowRows.map((row) => ({ sourceIndex: row.index, values: row.values }));

  while (remainingRows.length) {
    const lastLayout = layoutTableRows(lastTable, remainingRows);
    const lastError = validateTableResult(lastLayout, "last");
    if (lastError) return lastError;
    if (lastLayout.overflowRows.length === 0) {
      pages.push(pageResult(pageNumber++, "last", lastLayout.fittedRows));
      remainingRows = [];
      break;
    }

    const middleTable = findInvoiceTable(project, "middle");
    if (!middleTable) return missingTemplate("middle");
    const middleLayout = layoutTableRows(middleTable, remainingRows);
    const middleError = validateTableResult(middleLayout, "middle");
    if (middleError) return middleError;
    if (!middleLayout.fittedRows.length) return { success: false, error: "NO_PROGRESS", template: "middle", rowIndex: remainingRows[0].sourceIndex, message: "Mittelseite kann keine weitere Position aufnehmen." };
    pages.push(pageResult(pageNumber++, "middle", middleLayout.fittedRows));
    remainingRows = middleLayout.overflowRows.map((row) => ({ sourceIndex: row.index, values: row.values }));

    if (pages.length >= maxPages) return { success: false, error: "MAX_PAGES", message: "Pagination wurde abgebrochen, weil zu viele Seiten erzeugt würden." };
  }

  return { success: true, pages: pages.map((page, index) => ({ ...page, pageNumber: index + 1 })), totalPages: pages.length };
}
