import { projectState, getSelectedElement, selectedElements, createTextElement, createCoreElement, setSelection } from "./state.js";
import { createTableElement, scaleColumns, resizeColumn } from "./tables.js";
import { eventToPageMm } from "./coordinates.js";
import { clamp, snap } from "./utils.js";

const MIN_SIZE = 2;

export function addTextElement(position, coreId) {
  const element = coreId === "invoice_lines" ? createTableElement(projectState.elements.length + 1) : coreId ? createCoreElement(coreId, projectState.elements.length + 1) : createTextElement(projectState.elements.length + 1);
  if (!coreId) { const used = new Set(projectState.elements.map((item) => item.id)); const base = element.id; let suffix = 2; while (used.has(element.id)) element.id = `${base}_${suffix++}`; }
  if (position) { element.x = clamp(position.x - element.width / 2, 0, 210 - element.width); element.y = clamp(position.y - element.height / 2, 0, 297 - element.height); }
  projectState.elements.push(element); setSelection([element.uid]); return element;
}

export function removeSelectedElement() {
  const selected = new Set(projectState.selection.uids); if (!selected.size) return;
  projectState.elements = projectState.elements.filter((element) => !selected.has(element.uid)); setSelection([]);
}

export function beginPlacement(coreId = null) { projectState.placement = { active: true, coreId }; }
export function cancelPlacement() { projectState.placement = { active: false, coreId: null }; }

export function moveSelectedElement(dx, dy) {
  const selected = selectedElements(); if (!selected.length) return; const anchor = getSelectedElement(); const actualDx = clamp(round(anchor.x + dx), 0, 210 - anchor.width) - anchor.x; const actualDy = clamp(round(anchor.y + dy), 0, 297 - anchor.height) - anchor.y;
  selected.forEach((element) => { element.x = clamp(round(element.x + actualDx), 0, 210 - element.width); element.y = clamp(round(element.y + actualDy), 0, 297 - element.height); });
}

function round(value) { return Math.round(value * 10) / 10; }
function applySnap(value) { return projectState.editor.snapToGrid ? snap(value, projectState.editor.gridMm) : round(value); }

export function bindElementPointer(elementNode, pageNode, onChange, onSelect, onHistoryStart, onHistoryEnd) {
  elementNode.addEventListener("pointerdown", (event) => {
    if (event.button === 1) return;
    if (event.target.classList.contains("table-separator")) { event.stopPropagation(); const table = projectState.elements.find((item) => item.uid === elementNode.dataset.uid); if (!table) return; const index = Number(event.target.dataset.columnIndex); const startX = event.clientX; const original = table.columns[index].widthMm; onHistoryStart(); const move = (moveEvent) => { const delta = (moveEvent.clientX - startX) / pageNode.getBoundingClientRect().width * 210; if (resizeColumn(table, index, original + delta)) onChange(); }; const stop = () => { onHistoryEnd(); document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", stop); }; document.addEventListener("pointermove", move); document.addEventListener("pointerup", stop); return; }
    if (event.target.classList.contains("resize-handle") || event.target.classList.contains("table-separator")) return;
    const element = projectState.elements.find((item) => item.uid === elementNode.dataset.uid); if (!element) return;
    onSelect(element.uid, event);
    onHistoryStart();
    const start = eventToPageMm(event, pageNode); const origin = { x: element.x, y: element.y };
    let moved = false;
    const selected = selectedElements(); const origins = selected.map((item) => ({ uid: item.uid, x: item.x, y: item.y })); const move = (moveEvent) => { moved = true; const current = eventToPageMm(moveEvent, pageNode); const dx = applySnap(origin.x + current.x - start.x) - origin.x; const dy = applySnap(origin.y + current.y - start.y) - origin.y; origins.forEach((item) => { const target = projectState.elements.find((candidate) => candidate.uid === item.uid); if (target) { target.x = clamp(round(item.x + dx), 0, 210 - target.width); target.y = clamp(round(item.y + dy), 0, 297 - target.height); } }); onChange(); };
    const stop = () => { if (moved) onHistoryEnd(); else onChange(); document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", stop); };
    document.addEventListener("pointermove", move); document.addEventListener("pointerup", stop);
  });
  elementNode.querySelectorAll(".resize-handle").forEach((handle) => bindResize(handle, elementNode, pageNode, onChange, onHistoryStart, onHistoryEnd));
}


function bindResize(handle, elementNode, pageNode, onChange, onHistoryStart, onHistoryEnd) {
  handle.addEventListener("pointerdown", (event) => {
    if (event.button === 1) return;
    event.stopPropagation(); const element = projectState.elements.find((item) => item.uid === elementNode.dataset.uid); if (!element) return;
    onHistoryStart(); const start = eventToPageMm(event, pageNode); const origin = { ...element };
    const move = (moveEvent) => {
      const current = eventToPageMm(moveEvent, pageNode); const dx = current.x - start.x; const dy = current.y - start.y; const direction = handle.dataset.handle;
      let x = origin.x, y = origin.y, width = origin.width, height = origin.height;
      if (direction.includes("e")) width = origin.width + dx; if (direction.includes("s")) height = origin.height + dy;
      if (direction.includes("w")) { x = origin.x + dx; width = origin.width - dx; } if (direction.includes("n")) { y = origin.y + dy; height = origin.height - dy; }
      if (width >= MIN_SIZE) { element.x = clamp(applySnap(x), 0, 210 - MIN_SIZE); const oldWidth = element.width; element.width = clamp(applySnap(width), MIN_SIZE, 210 - element.x); if (element.type === "table") scaleColumns(element, oldWidth, element.width); }
      if (height >= MIN_SIZE) { element.y = clamp(applySnap(y), 0, 297 - MIN_SIZE); element.height = clamp(applySnap(height), MIN_SIZE, 297 - element.y); }
      onChange();
    };
    const stop = () => { onHistoryEnd(); document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", stop); };
    document.addEventListener("pointermove", move); document.addEventListener("pointerup", stop);
  });
}
