import { projectState, getSelectedElement, selectedElements, setSelection, toggleSelection, TEMPLATE_LABELS, TEMPLATE_TYPES, saveActiveTemplateView, switchTemplate, templateHasContent } from "./state.js";
import { renderCanvas, setBackground } from "./canvas.js";
import { addTextElement, removeSelectedElement, moveSelectedElement, beginPlacement, cancelPlacement } from "./elements.js?v=30";
import { updatePropertiesPanel, bindProperties } from "./properties.js";
import { exportProject, importProject } from "./project.js";
import { clamp, readFileAsDataUrl } from "./utils.js";
import { capture, record, undo, redo, canUndo, canRedo, clear } from "./history.js";
import { validateTable, resizeColumn, scaleColumns } from "./tables.js";
import { layoutTableRows } from "./rowLayout.js";
import { paginateInvoiceRows } from "./pagination.js";
import { TEST_ROWS } from "./tables.js";

const $ = (id) => document.getElementById(id);
const dom = {
  page: $("page"), stage: $("canvas-stage"), ghost: $("placement-ghost"), elementsLayer: $("elements-layer"), gridLayer: $("grid-layer"),
  backgroundImage: $("background-image"), form: $("properties-form"), tableForm: $("table-properties"), multi: $("multi-properties"),
  empty: $("empty-properties"), label: $("selection-label"), elementList: $("element-list"), count: $("element-count"),
  zoomSelect: $("zoom-select"), zoomLabel: $("zoom-label"), viewport: $("canvas-viewport"), gridToggle: $("grid-toggle"), gridSize: $("grid-size"),
  snapToggle: $("snap-toggle"), projectInput: $("project-input"), backgroundInput: $("background-input"), undo: $("undo-button"), redo: $("redo-button"), toast: $("toast-region"),
  paginationRowCount: $("pagination-row-count"), paginationPreview: $("pagination-preview"), templateTabs: [...document.querySelectorAll("[data-template]")]
};
["property-name", "property-id", "property-x", "property-y", "property-width", "property-height", "property-font-family", "property-font-size", "property-color", "property-multiline", "property-test-value"].forEach((id) => { dom[id] = $(id); });
dom.fontWeight = [...document.querySelectorAll("input[name=font-weight]")]; dom.align = [...document.querySelectorAll("input[name=align]")];

function inputFocused() { const element = document.activeElement; return element && (element.matches("input, textarea, select, [contenteditable=true]") || element.isContentEditable); }
function toast(message, type = "info") { const item = document.createElement("div"); item.className = `toast ${type}`; item.textContent = message; dom.toast.append(item); setTimeout(() => item.remove(), 2800); }
function restore(snapshot) { const view = { zoom: projectState.editor.zoom, camera: projectState.editor.camera }; const transientEditor = { backgroundDataUrls: projectState.editor.backgroundDataUrls }; const clipboard = projectState.clipboard; const selection = projectState.selection; Object.assign(projectState, snapshot); projectState.editor = { ...projectState.editor, ...transientEditor, ...view }; projectState.clipboard = clipboard; setSelection(selection.uids, selection.lastUid); render(); }
function edit(action) { const before = capture(projectState); action(); record(before, projectState); render(); updateHistoryButtons(); }
function select(uid, event, range = false) { const ids = projectState.elements.map((element) => element.uid); if (range) { const last = ids.indexOf(projectState.selection.lastUid); const next = ids.indexOf(uid); const start = Math.min(last < 0 ? next : last, next); const end = Math.max(last < 0 ? next : last, next); setSelection(ids.slice(start, end + 1), uid); } else if (event?.ctrlKey || event?.metaKey) toggleSelection(uid); else if (!projectState.selection.uids.includes(uid)) setSelection([uid]); render(); }
function escapeHtml(value) { const span = document.createElement("span"); span.textContent = value; return span.innerHTML; }
function renderElementList() { dom.count.textContent = projectState.elements.length; dom.elementList.replaceChildren(); projectState.elements.forEach((element) => { const item = document.createElement("div"); item.className = `element-item${projectState.selection.uids.includes(element.uid) ? " selected" : ""}${projectState.selection.anchorUid === element.uid ? " anchor" : ""}`; item.innerHTML = `<strong>${escapeHtml(element.name)}</strong><small>${escapeHtml(element.id)}${element.type === "table" ? " · table" : ""}</small>`; item.addEventListener("click", (event) => select(element.uid, event, event.shiftKey)); dom.elementList.append(item); }); }
function paginationRows() { const count = Math.max(1, Math.min(500, Number(projectState.editor.paginationRowCount) || 25)); return Array.from({ length: count }, (_, index) => ({ ...TEST_ROWS[index % TEST_ROWS.length], line_position: String(index + 1) })); }
function renderTemplateTabs() { dom.templateTabs.forEach((button) => { const type = button.dataset.template; button.classList.toggle("active", type === projectState.activeTemplate); button.querySelector(".template-status").textContent = templateHasContent(type) ? "●" : "○"; }); }
function renderPaginationPreview() {
  dom.paginationRowCount.value = projectState.editor.paginationRowCount;
  const result = paginateInvoiceRows(projectState, paginationRows());
  if (!result.success) {
    dom.paginationPreview.innerHTML = `<div class="error">${escapeHtml(result.message || result.error)}</div>`;
    return;
  }
  dom.paginationPreview.innerHTML = [`<div><strong>Testpositionen:</strong> ${projectState.editor.paginationRowCount}</div>`, `<div><strong>Seiten:</strong> ${result.totalPages}</div>`, ...result.pages.map((page) => `<div>${page.pageNumber} · ${escapeHtml(page.label || TEMPLATE_LABELS[page.template])} · ${page.rows.length} Positionen</div>`)].join("");
}
function updateMultiPanel() { const multiple = projectState.selection.uids.length > 1; dom.multi.hidden = !multiple; if (multiple) { $("multi-count").textContent = `${projectState.selection.uids.length} Elemente ausgewählt`; $("multi-anchor").textContent = getSelectedElement()?.name || ""; } }
function render() { renderCanvas(dom, render, select, () => { dom.dragBefore = capture(projectState); }, () => { if (dom.dragBefore) record(dom.dragBefore, projectState); updateHistoryButtons(); }); const selected = getSelectedElement(); if (projectState.selection.uids.length === 1 && selected?.type === "table") { dom.form.hidden = true; dom.tableForm.hidden = false; dom.empty.hidden = true; dom.label.textContent = "AUSGEWÄHLT"; updateTablePanel(selected); } else if (projectState.selection.uids.length === 1) { dom.tableForm.hidden = true; updatePropertiesPanel(dom, render); } else { dom.form.hidden = true; dom.tableForm.hidden = true; dom.empty.hidden = Boolean(projectState.selection.uids.length); dom.label.textContent = projectState.selection.uids.length ? "MEHRFACH AUSGEWÄHLT" : "NICHTS AUSGEWÄHLT"; } updateMultiPanel(); renderElementList(); renderTemplateTabs(); renderPaginationPreview(); dom.zoomLabel.textContent = `${TEMPLATE_LABELS[projectState.activeTemplate]} · ${Math.round(projectState.editor.zoom * 100)} %`; dom.zoomSelect.value = String(Math.round(projectState.editor.zoom * 100)); dom.gridToggle.checked = projectState.editor.gridVisible; dom.gridSize.value = String(projectState.editor.gridMm); dom.snapToggle.checked = projectState.editor.snapToGrid; updateHistoryButtons(); }
function updateHistoryButtons() { dom.undo.disabled = !canUndo(); dom.redo.disabled = !canRedo(); }
function setZoom(zoom) { projectState.editor.zoom = Math.max(.1, Math.min(6, zoom)); saveActiveTemplateView(); render(); }
function centerCamera() { projectState.editor.camera = { panX: 0, panY: 0 }; saveActiveTemplateView(); render(); const v = dom.viewport.getBoundingClientRect(); const p = dom.page.getBoundingClientRect(); dom.viewport.scrollLeft += p.left + p.width / 2 - (v.left + v.width / 2); dom.viewport.scrollTop += p.top + p.height / 2 - (v.top + v.height / 2); }
function fitToWindow() { projectState.editor.zoom = Math.max(.1, Math.min(6, Math.min((dom.viewport.clientWidth - 48) / 794, (dom.viewport.clientHeight - 48) / 1123))); centerCamera(); }
function align(type) { const anchor = getSelectedElement(); if (!anchor) return; edit(() => selectedElements().forEach((element) => { if (element.uid === anchor.uid) return; if (type === "left") element.x = anchor.x; if (type === "right") element.x = anchor.x + anchor.width - element.width; if (type === "centerX") element.x = anchor.x + (anchor.width - element.width) / 2; if (type === "top") element.y = anchor.y; if (type === "bottom") element.y = anchor.y + anchor.height - element.height; if (type === "centerY") element.y = anchor.y + (anchor.height - element.height) / 2; if (type === "width" || type === "size") element.width = anchor.width; if (type === "height" || type === "size") element.height = anchor.height; })); }
function distribute(axis) { const selected = selectedElements(); if (selected.length < 3) return; const ordered = [...selected].sort((a, b) => a[axis] - b[axis]); const end = axis === "x" ? ordered.at(-1).x + ordered.at(-1).width : ordered.at(-1).y + ordered.at(-1).height; const total = ordered.reduce((sum, element) => sum + (axis === "x" ? element.width : element.height), 0); const gap = (end - (axis === "x" ? ordered[0].x : ordered[0].y) - total) / (ordered.length - 1); edit(() => { let cursor = axis === "x" ? ordered[0].x : ordered[0].y; ordered.forEach((element, index) => { if (index > 0) { cursor += (axis === "x" ? ordered[index - 1].width : ordered[index - 1].height) + gap; element[axis] = cursor; } }); }); }
function applySpacing(axis) { const anchor = getSelectedElement(); const gap = Math.max(0, Number($("spacing-value").value) || 0); if (!anchor || selectedElements().length < 2) return; const coordinate = axis === "x" ? "x" : "y"; const size = axis === "x" ? "width" : "height"; const others = selectedElements().filter((element) => element.uid !== anchor.uid); edit(() => { let cursor = anchor[coordinate] + anchor[size]; others.filter((element) => element[coordinate] >= anchor[coordinate]).sort((a, b) => a[coordinate] - b[coordinate]).forEach((element) => { element[coordinate] = cursor + gap; cursor = element[coordinate] + element[size]; }); }); }
function copySelected() { const selected = selectedElements(); if (!selected.length) return false; projectState.clipboard = structuredClone(selected); toast(`${selected.length} Element${selected.length === 1 ? "" : "e"} kopiert.`, "success"); return true; }
function paste() { const source = projectState.clipboard || []; if (!source.length) return; const before = capture(projectState); const used = new Set(projectState.elements.map((element) => element.id)); const added = []; source.forEach((original) => { if (original.elementClass === "core" && used.has(original.id)) { toast(`${original.name} wurde nicht eingefügt: Core-Element bereits vorhanden.`, "warning"); return; } const element = structuredClone(original); element.uid = `el_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; element.x = Math.min(210 - element.width, element.x + 2); element.y = Math.min(297 - element.height, element.y + 2); if (element.elementClass !== "core") { const base = `${element.id}_copy`; element.id = base; let suffix = 2; while (used.has(element.id)) element.id = `${base}_${suffix++}`; } used.add(element.id); projectState.elements.push(element); added.push(element.uid); }); if (added.length) { setSelection(added); record(before, projectState); toast(`${added.length} Element${added.length === 1 ? "" : "e"} eingefügt.`, "success"); render(); } }
function updateTablePanel(table) {
  const tableFields = {
    name: "table-name",
    id: "table-id",
    x: "table-x",
    y: "table-y",
    width: "table-width",
    height: "table-height",
    rowHeightMm: "table-row-height",
    minRowHeightMm: "table-min-row-height",
    cellPaddingHorizontalMm: "table-padding-horizontal",
    cellPaddingVerticalMm: "table-padding-vertical",
    lineHeight: "table-line-height",
    textOffsetYmm: "table-offset"
  };
  Object.entries(tableFields).forEach(([key, id]) => { $(id).value = table[key]; });
  $("table-row-height").disabled = table.rowMode !== "fixed";
  $("table-min-row-height").disabled = table.rowMode !== "dynamic";
  $("table-max-rows").value = validateTable(table).maxRows;
  document.querySelectorAll("input[name=table-row-mode]").forEach((input) => { input.checked = input.value === table.rowMode; });
  $("table-vertical-align").value = table.verticalAlign;
  $("table-test-data").checked = Boolean(table.showTestData);

  const result = validateTable(table);
  const layout = table.showTestData ? layoutTableRows(table, TEST_ROWS) : null;
  const messages = [
    ...result.errors.map((message) => ({ type: "error", text: `Fehler: ${message}` })),
    ...result.warnings.map((message) => ({ type: "warning", text: `Warnung: ${message}` }))
  ];
  if (layout) {
    layout.oversizedRows.forEach((row) => messages.push({ type: "warning", text: `Warnung: Position ${row.index + 1} ist höher als der verfügbare Tabellenbereich.` }));
    if (layout.hasHorizontalOverflow) messages.push({ type: "warning", text: "Warnung: Mindestens eine Testzelle überschreitet ihre Spaltenbreite." });
    if (layout.multiSlotRows.length) messages.push({ type: "warning", text: "Warnung: Mehrzeilige Position belegt mehrere Rasterzeilen. Vorhandene horizontale Hintergrundlinien können den Textbereich durchqueren." });
  }
  $("table-validation").innerHTML = messages.map((message) => `<div class="${message.type}">${escapeHtml(message.text)}</div>`).join("");
  $("table-layout-preview").textContent = layout ? `Positionen gesamt: ${layout.rows.length} · Passen: ${layout.fittedRows.length} · Überlauf: ${layout.overflowRows.length} · Verwendete Höhe: ${layout.usedHeightMm.toFixed(1)} mm · Rest: ${layout.remainingHeightMm.toFixed(1)} mm` : "";

  const columns = $("table-columns");
  columns.replaceChildren();
  table.columns.forEach((column, index) => {
    const row = document.createElement("div");
    row.className = "column-property";
    row.innerHTML = `<strong>${escapeHtml(column.name)}</strong><small>${escapeHtml(column.id)}</small><input class="column-width" type="number" min="3" step="0.1" value="${column.widthMm}"><select class="column-align"><option value="left">Links</option><option value="center">Zentriert</option><option value="right">Rechts</option></select><label class="column-wrap"><input type="checkbox"> Umbruch</label><input class="column-font-size" type="number" min="1" step="0.5" value="${column.fontSizePt}"><select class="column-font-weight"><option value="normal">Normal</option><option value="bold">Fett</option></select>`;
    row.querySelector(".column-align").value = column.align;
    row.querySelector(".column-wrap input").checked = Boolean(column.wrap);
    row.querySelector(".column-font-weight").value = column.fontWeight;
    row.querySelector(".column-width").addEventListener("change", (event) => { const before = capture(projectState); if (!resizeColumn(table, index, Number(event.target.value))) { toast("Spaltenbreite kann nicht angewendet werden.", "warning"); return; } record(before, projectState); render(); });
    row.querySelector(".column-align").addEventListener("change", (event) => { edit(() => { column.align = event.target.value; }); });
    row.querySelector(".column-wrap input").addEventListener("change", (event) => { edit(() => { column.wrap = event.target.checked; }); });
    row.querySelector(".column-font-size").addEventListener("change", (event) => { edit(() => { column.fontSizePt = Math.max(1, Number(event.target.value) || 9); }); });
    row.querySelector(".column-font-weight").addEventListener("change", (event) => { edit(() => { column.fontWeight = event.target.value; }); });
    columns.append(row);
  });
}

$("add-text-button").addEventListener("click", () => { beginPlacement(); render(); }); document.querySelectorAll("[data-core-id]").forEach((button) => button.addEventListener("click", () => { if (projectState.elements.some((element) => element.id === button.dataset.coreId)) { toast(button.dataset.coreId === "invoice_lines" ? "Positionstabelle wurde nicht eingefügt: Core-Element bereits vorhanden." : "Core-Feld bereits vorhanden.", "warning"); return; } beginPlacement(button.dataset.coreId); render(); })); $("delete-button").addEventListener("click", () => edit(removeSelectedElement)); $("table-delete-button").addEventListener("click", () => edit(removeSelectedElement)); $("export-button").addEventListener("click", () => { exportProject(); toast("Projekt exportiert.", "success"); }); $("import-button").addEventListener("click", () => dom.projectInput.click()); $("fit-button").addEventListener("click", fitToWindow); dom.undo.addEventListener("click", () => { if (undo(projectState, restore)) updateHistoryButtons(); }); dom.redo.addEventListener("click", () => { if (redo(projectState, restore)) updateHistoryButtons(); });
dom.projectInput.addEventListener("change", async () => { if (!dom.projectInput.files[0]) return; try { await importProject(dom.projectInput.files[0]); clear(); render(); centerCamera(); } catch (error) { toast(`Projekt konnte nicht geladen werden: ${error.message}`, "error"); } dom.projectInput.value = ""; }); $("background-button").addEventListener("click", () => dom.backgroundInput.click()); dom.backgroundInput.addEventListener("change", async () => { const file = dom.backgroundInput.files[0]; if (file) { const before = capture(projectState); setBackground(dom, await readFileAsDataUrl(file), file.name); record(before, projectState); updateHistoryButtons(); render(); } dom.backgroundInput.value = ""; }); dom.zoomSelect.addEventListener("change", () => setZoom(Number(dom.zoomSelect.value) / 100)); dom.gridToggle.addEventListener("change", () => { projectState.editor.gridVisible = dom.gridToggle.checked; render(); }); dom.gridSize.addEventListener("change", () => { projectState.editor.gridMm = Number(dom.gridSize.value); render(); }); dom.snapToggle.addEventListener("change", () => { projectState.editor.snapToGrid = dom.snapToggle.checked; render(); });
dom.templateTabs.forEach((button) => button.addEventListener("click", () => { if (switchTemplate(button.dataset.template)) centerCamera(); else render(); }));
dom.paginationRowCount.addEventListener("change", () => { projectState.editor.paginationRowCount = Math.max(1, Math.min(500, Number(dom.paginationRowCount.value) || 25)); render(); });
dom.page.addEventListener("pointermove", (event) => { if (!projectState.placement.active) return; const rect = dom.page.getBoundingClientRect(); dom.ghost.style.left = `${Math.max(0, Math.min(rect.width, event.clientX - rect.left))}px`; dom.ghost.style.top = `${Math.max(0, Math.min(rect.height, event.clientY - rect.top))}px`; }); dom.page.addEventListener("pointerdown", (event) => { if (event.button === 1) return; if (projectState.placement.active) { const rect = dom.page.getBoundingClientRect(); edit(() => { addTextElement({ x: (event.clientX - rect.left) / rect.width * 210, y: (event.clientY - rect.top) / rect.height * 297 }, projectState.placement.coreId); cancelPlacement(); }); return; } if (event.target === dom.page || event.target === dom.gridLayer || event.target === dom.backgroundImage) { setSelection([]); render(); } });
$("table-test-data").addEventListener("change", (event) => { const table = getSelectedElement(); if (table?.type !== "table") return; edit(() => { table.showTestData = event.target.checked; }); });
["table-x", "table-y", "table-width", "table-height"].forEach((id) => $(id).addEventListener("change", (event) => {
  const table = getSelectedElement();
  if (!table || table.type !== "table") return;
  edit(() => {
    const value = Number(event.target.value);
    if (!Number.isFinite(value)) return;
    if (id === "table-x") table.x = clamp(value, 0, 210 - table.width);
    if (id === "table-y") table.y = clamp(value, 0, 297 - table.height);
    if (id === "table-width") { const oldWidth = table.width; table.width = clamp(value, 2, 210 - table.x); scaleColumns(table, oldWidth, table.width); }
    if (id === "table-height") table.height = clamp(value, 2, 297 - table.y);
  });
}));
["table-row-height", "table-min-row-height", "table-padding-horizontal", "table-padding-vertical", "table-line-height", "table-offset"].forEach((id) => $(id).addEventListener("change", (event) => { const table = getSelectedElement(); if (!table || table.type !== "table") return; edit(() => { const keys = { "table-row-height": "rowHeightMm", "table-min-row-height": "minRowHeightMm", "table-padding-horizontal": "cellPaddingHorizontalMm", "table-padding-vertical": "cellPaddingVerticalMm", "table-line-height": "lineHeight", "table-offset": "textOffsetYmm" }; table[keys[id]] = Number(event.target.value); }); })); document.querySelectorAll("input[name=table-row-mode]").forEach((input) => input.addEventListener("change", (event) => { const table = getSelectedElement(); if (table?.type === "table") edit(() => { table.rowMode = event.target.value; }); })); $("table-vertical-align").addEventListener("change", (event) => { const table = getSelectedElement(); if (table?.type === "table") edit(() => { table.verticalAlign = event.target.value; }); });
dom.viewport.addEventListener("pointerdown", (event) => { if (event.button !== 1) return; event.preventDefault(); event.stopPropagation(); dom.viewport.classList.add("panning"); const start = { x: event.clientX, y: event.clientY, ...projectState.editor.camera }; try { dom.viewport.setPointerCapture(event.pointerId); } catch { } const move = (moveEvent) => { projectState.editor.camera.panX = start.panX + moveEvent.clientX - start.x; projectState.editor.camera.panY = start.panY + moveEvent.clientY - start.y; saveActiveTemplateView(); render(); }; const stop = () => { dom.viewport.classList.remove("panning"); document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", stop); }; document.addEventListener("pointermove", move); document.addEventListener("pointerup", stop); }, true); dom.viewport.addEventListener("wheel", (event) => { event.preventDefault(); if (event.ctrlKey) setZoom(projectState.editor.zoom + (event.deltaY > 0 ? -.05 : .05)); else { projectState.editor.camera.panX += event.shiftKey ? event.deltaY : 0; projectState.editor.camera.panY += event.shiftKey ? 0 : event.deltaY; saveActiveTemplateView(); render(); } }, { passive: false });
document.addEventListener("keydown", (event) => { if (inputFocused()) return; const modifier = event.ctrlKey || event.metaKey; if (modifier && event.key.toLowerCase() === "a") { event.preventDefault(); setSelection(projectState.elements.map((element) => element.uid)); render(); } else if (modifier && event.key.toLowerCase() === "c") { event.preventDefault(); copySelected(); } else if (modifier && event.key.toLowerCase() === "v") { event.preventDefault(); paste(); } else if (modifier && event.key.toLowerCase() === "x") { event.preventDefault(); if (copySelected()) edit(removeSelectedElement); } else if (modifier && event.key.toLowerCase() === "d") { event.preventDefault(); if (copySelected()) paste(); } else if (modifier && event.key.toLowerCase() === "z") { event.preventDefault(); if (event.shiftKey ? redo(projectState, restore) : undo(projectState, restore)) updateHistoryButtons(); } else if (modifier && event.key.toLowerCase() === "y") { event.preventDefault(); if (redo(projectState, restore)) updateHistoryButtons(); } else if (event.key === "Escape") { event.preventDefault(); cancelPlacement(); setSelection([]); render(); } else if (event.key === "Delete") { event.preventDefault(); edit(removeSelectedElement); } else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) { event.preventDefault(); edit(() => { const step = event.shiftKey ? 1 : .1; moveSelectedElement(event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0, event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0); }); } }); document.querySelectorAll("[data-align]").forEach((button) => button.addEventListener("click", () => align(button.dataset.align))); document.querySelectorAll("[data-distribute]").forEach((button) => button.addEventListener("click", () => distribute(button.dataset.distribute === "horizontal" ? "x" : "y"))); document.querySelectorAll("[data-spacing-apply]").forEach((button) => button.addEventListener("click", () => applySpacing(button.dataset.spacingApply === "horizontal" ? "x" : "y"))); document.querySelectorAll("[data-spacing-step]").forEach((button) => button.addEventListener("click", () => { const input = $("spacing-value"); input.value = Math.max(0, (Number(input.value) || 0) + Number(button.dataset.spacingStep)).toFixed(1); })); let propertyBefore = null; bindProperties(dom, () => render(), () => { if (!propertyBefore) propertyBefore = capture(projectState); }, () => { if (propertyBefore) { record(propertyBefore, projectState); propertyBefore = null; updateHistoryButtons(); } }); window.addEventListener("resize", centerCamera); render(); updateHistoryButtons(); centerCamera();
