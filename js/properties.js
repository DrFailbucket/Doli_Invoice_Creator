import { projectState, getSelectedElement } from "./state.js";
import { clamp } from "./utils.js";

const fields = { name: "property-name", id: "property-id", x: "property-x", y: "property-y", width: "property-width", height: "property-height", fontFamily: "property-font-family", fontSizePt: "property-font-size", color: "property-color", multiline: "property-multiline", testValue: "property-test-value" };

export function updatePropertiesPanel(dom, onChange) {
  const element = getSelectedElement(); dom.form.hidden = !element; dom.empty.hidden = Boolean(element); dom.label.textContent = element ? "AUSGEWÄHLT" : "NICHTS AUSGEWÄHLT"; if (!element) return;
  Object.entries(fields).forEach(([key, id]) => { dom[id].value = element[key]; });
  dom["property-id"].readOnly = element.elementClass === "core";
  dom.fontWeight.forEach((input) => { input.checked = input.value === element.fontWeight; }); dom.align.forEach((input) => { input.checked = input.value === element.align; });
}

export function bindProperties(dom, onChange, onBeforeChange, onAfterChange) {
  Object.entries(fields).forEach(([key, id]) => {
    dom[id].addEventListener("input", () => {
      const element = getSelectedElement();
      if (!element) return;
      onBeforeChange?.();
      if (key === "id") {
        if (element.elementClass === "core") { dom[id].value = element.id; return; }
        const nextId = dom[id].value.trim();
        const invalid = !/^[a-zA-Z0-9_.-]+$/.test(nextId) || projectState.elements.some((item) => item.uid !== element.uid && item.id === nextId);
        dom[id].setCustomValidity(invalid ? "ID muss eindeutig sein und darf nur Buchstaben, Zahlen, _, ., - enthalten." : "");
        if (invalid) return;
      }
      if (["x", "y", "width", "height", "fontSizePt"].includes(key)) {
        const value = Number(dom[id].value);
        if (!Number.isFinite(value)) return;
        element[key] = key === "x" ? clamp(value, 0, 210 - element.width) : key === "y" ? clamp(value, 0, 297 - element.height) : key === "width" ? clamp(value, 2, 210 - element.x) : key === "height" ? clamp(value, 2, 297 - element.y) : Math.max(1, value);
      } else element[key] = key === "multiline" ? dom[id].value === "true" : dom[id].value;
      onChange();
    });
    dom[id].addEventListener("change", () => onAfterChange?.());
  });
  dom.fontWeight.forEach((input) => input.addEventListener("change", () => { const element = getSelectedElement(); if (element) { onBeforeChange?.(); element.fontWeight = input.value; onChange(); onAfterChange?.(); } }));
  dom.align.forEach((input) => input.addEventListener("change", () => { const element = getSelectedElement(); if (element) { onBeforeChange?.(); element.align = input.value; onChange(); onAfterChange?.(); } }));
}
