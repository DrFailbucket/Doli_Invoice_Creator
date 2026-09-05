import { projectState } from "./state.js";
import { mmToPx } from "./coordinates.js";
import { bindElementPointer } from "./elements.js";
import { columnXPositions, TEST_ROWS } from "./tables.js";
import { layoutTableRows } from "./rowLayout.js";

const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

export function renderCanvas(dom, onChange, onSelect, onHistoryStart, onHistoryEnd) {
  const { page, elementsLayer, gridLayer } = dom; elementsLayer.replaceChildren();
  const activeBackground = projectState.page.background?.fileName ? projectState.editor.backgroundDataUrls[projectState.activeTemplate] : null;
  dom.backgroundImage.hidden = !activeBackground;
  if (activeBackground && dom.backgroundImage.src !== activeBackground) dom.backgroundImage.src = activeBackground;
  page.style.setProperty("--page-width", `${794 * projectState.editor.zoom}px`); page.style.setProperty("--page-height", `${1123 * projectState.editor.zoom}px`);
  dom.stage.style.width = "60000px"; dom.stage.style.height = "60000px";
  page.style.left = `${30000 + projectState.editor.camera.panX - (794 * projectState.editor.zoom) / 2}px`;
  page.style.top = `${30000 + projectState.editor.camera.panY - (1123 * projectState.editor.zoom) / 2}px`;
  gridLayer.classList.toggle("hidden", !projectState.editor.gridVisible);
  const pageWidthPx = page.clientWidth; const pageHeightPx = page.clientHeight; const gridPx = mmToPx(projectState.editor.gridMm, pageWidthPx, pageHeightPx, "x");
  gridLayer.style.backgroundSize = `${gridPx}px ${gridPx}px`;
  projectState.elements.forEach((element) => {
    const selected = projectState.selection.uids.includes(element.uid); const anchor = projectState.selection.anchorUid === element.uid; const node = document.createElement("div"); node.className = `text-element${selected ? " multi-selected" : ""}${anchor ? " multi-anchor" : ""}`; node.dataset.uid = element.uid;
    node.style.left = `${mmToPx(element.x, pageWidthPx, pageHeightPx, "x")}px`; node.style.top = `${mmToPx(element.y, pageWidthPx, pageHeightPx, "y")}px`; node.style.width = `${mmToPx(element.width, pageWidthPx, pageHeightPx, "x")}px`; node.style.height = `${mmToPx(element.height, pageWidthPx, pageHeightPx, "y")}px`;
    if (element.type === "table") { renderTable(node, element, pageWidthPx, pageHeightPx, selected); } else { node.style.fontFamily = element.fontFamily; node.style.fontSize = `${element.fontSizePt * 96 / 72 * projectState.editor.zoom}px`; node.style.fontWeight = element.fontWeight; node.style.justifyContent = element.align === "right" ? "flex-end" : element.align === "center" ? "center" : "flex-start"; node.style.textAlign = element.align; node.style.color = element.color; node.style.whiteSpace = element.multiline ? "pre-wrap" : "nowrap"; node.textContent = element.testValue; }
    if (projectState.selection.uids.length === 1 && selected) handles.forEach((handleName) => { const handle = document.createElement("span"); handle.className = `resize-handle handle-${handleName}`; handle.dataset.handle = handleName; node.append(handle); });
    elementsLayer.append(node); bindElementPointer(node, page, onChange, onSelect, onHistoryStart, onHistoryEnd);
  });
  dom.ghost.hidden = !projectState.placement.active;
  if (!dom.ghost.hidden) { dom.ghost.classList.toggle("table-ghost", projectState.placement.coreId === "invoice_lines"); dom.ghost.textContent = projectState.placement.label || (projectState.placement.coreId === "object_ref" ? "Dokumentnummer" : projectState.placement.coreId === "object_date" ? "Dokumentdatum" : projectState.placement.coreId === "invoice_lines" ? "Positionstabelle" : "Beispieltext"); }
}

function renderTable(node, table, pageWidthPx, pageHeightPx, selected) {
  node.classList.add("table-element");
  const height = mmToPx(table.height, pageWidthPx, pageHeightPx, "y");
  const xs = columnXPositions(table);
  const layout = layoutTableRows(table, table.showTestData ? TEST_ROWS : []);
  table.layoutResult = layout;

  table.columns.forEach((column, index) => {
    const columnNode = document.createElement("div");
    columnNode.className = "table-column table-header-overlay";
    columnNode.style.left = `${mmToPx(xs[index], pageWidthPx, pageHeightPx, "x")}px`;
    columnNode.style.width = `${mmToPx(column.widthMm, pageWidthPx, pageHeightPx, "x")}px`;
    columnNode.style.height = `${mmToPx(5, pageWidthPx, pageHeightPx, "y")}px`;
    columnNode.style.top = `-${mmToPx(5.5, pageWidthPx, pageHeightPx, "y")}px`;
    columnNode.textContent = column.name;
    columnNode.style.textAlign = column.align;
    columnNode.style.fontFamily = table.fontFamily;
    columnNode.style.fontSize = `${column.fontSizePt * 96 / 72 * projectState.editor.zoom}px`;
    columnNode.style.fontWeight = column.fontWeight;
    node.append(columnNode);
  });

  if (table.rowMode === "fixed") {
    const guideStep = Math.max(0.1, Number(table.rowHeightMm) || 7);
    for (let y = 0; y <= table.height + 0.01; y += guideStep) {
      const line = document.createElement("i");
      line.className = "table-row-guide fixed-guide";
      line.style.top = `${mmToPx(y, pageWidthPx, pageHeightPx, "y")}px`;
      node.append(line);
    }
  } else {
    [0, ...layout.fittedRows.map((row) => row.yMm + row.heightMm)].forEach((y) => {
      const line = document.createElement("i");
      line.className = "table-row-guide dynamic-guide";
      line.style.top = `${mmToPx(y, pageWidthPx, pageHeightPx, "y")}px`;
      node.append(line);
    });
  }

  if (selected && projectState.selection.uids.length === 1) table.columns.slice(0, -1).forEach((column, index) => {
    const separator = document.createElement("span");
    separator.className = "table-separator";
    separator.dataset.columnIndex = index;
    separator.style.left = `${mmToPx(xs[index] + column.widthMm, pageWidthPx, pageHeightPx, "x")}px`;
    separator.style.height = `${height}px`;
    node.append(separator);
  });

  if (table.showTestData) layout.fittedRows.forEach((row) => row.cells.forEach((cellData, index) => {
    const column = table.columns[index];
    const measurement = row.measurements[index];
    const availableContentHeight = Math.max(0.1, row.heightMm - table.cellPaddingVerticalMm * 2);
    const extraHeight = Math.max(0, availableContentHeight - measurement.contentHeightMm);
    const alignFactor = table.verticalAlign === "bottom" ? 1 : table.verticalAlign === "middle" ? 0.5 : 0;
    const cell = document.createElement("span");
    cell.className = `table-cell${measurement.horizontalOverflow ? " table-overflow" : ""}`;
    cell.textContent = cellData.value;
    cell.style.left = `${mmToPx(xs[index] + table.cellPaddingHorizontalMm, pageWidthPx, pageHeightPx, "x")}px`;
    cell.style.top = `${mmToPx(row.yMm + table.cellPaddingVerticalMm + extraHeight * alignFactor + table.textOffsetYmm, pageWidthPx, pageHeightPx, "y")}px`;
    cell.style.width = `${mmToPx(Math.max(1, column.widthMm - table.cellPaddingHorizontalMm * 2), pageWidthPx, pageHeightPx, "x")}px`;
    cell.style.height = `${mmToPx(Math.max(1, measurement.contentHeightMm + 0.2), pageWidthPx, pageHeightPx, "y")}px`;
    cell.style.fontFamily = table.fontFamily;
    cell.style.fontSize = `${column.fontSizePt * 96 / 72 * projectState.editor.zoom}px`;
    cell.style.fontWeight = column.fontWeight;
    cell.style.lineHeight = String(table.lineHeight);
    cell.style.textAlign = column.align;
    cell.style.whiteSpace = column.wrap ? "normal" : "nowrap";
    cell.style.color = table.color;
    node.append(cell);
  }));
}

export function setBackground(dom, dataUrl, fileName) { projectState.editor.backgroundDataUrls[projectState.activeTemplate] = dataUrl; dom.backgroundImage.src = dataUrl; dom.backgroundImage.hidden = false; projectState.page.background.fileName = fileName; }
