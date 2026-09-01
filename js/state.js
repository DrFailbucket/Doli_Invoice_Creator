import { createDefaultColumns, normalizeTableColumns } from "./tables.js";

export const PAGE_WIDTH_MM = 210;
export const PAGE_HEIGHT_MM = 297;
export const TEMPLATE_TYPES = ["single", "first", "middle", "last"];
export const TEMPLATE_LABELS = {
  single: "Einseitig",
  first: "Erste Seite",
  middle: "Mittelseite",
  last: "Endseite"
};

function createPage() {
  return { widthMm: PAGE_WIDTH_MM, heightMm: PAGE_HEIGHT_MM, background: { fileName: "" } };
}

function createTemplate() {
  return { page: createPage(), elements: [] };
}

function createTemplates() {
  return Object.fromEntries(TEMPLATE_TYPES.map((type) => [type, createTemplate()]));
}

function createTemplateViews() {
  return Object.fromEntries(TEMPLATE_TYPES.map((type) => [type, { zoom: 1, camera: { panX: 0, panY: 0 } }]));
}

export const projectState = {
  version: 4,
  documentType: "invoice",
  activeTemplate: "single",
  templates: createTemplates(),
  editor: {
    gridMm: 1,
    snapToGrid: true,
    gridVisible: true,
    zoom: 1,
    camera: { panX: 0, panY: 0 },
    templateViews: createTemplateViews(),
    backgroundDataUrls: {},
    paginationRowCount: 25
  },
  selection: { uids: [], anchorUid: null, lastUid: null },
  placement: { active: false, coreId: null },
  clipboard: []
};

Object.defineProperties(projectState, {
  pageType: {
    enumerable: false,
    get() { return this.activeTemplate; },
    set(value) { if (TEMPLATE_TYPES.includes(value)) this.activeTemplate = value; }
  },
  page: {
    enumerable: false,
    get() { return getActivePage(); },
    set(value) { getActiveTemplate().page = normalizePage(value); }
  },
  elements: {
    enumerable: false,
    get() { return getActiveElements(); },
    set(value) { getActiveTemplate().elements = normalizeElements(value); }
  }
});

export function getActiveTemplate() {
  if (!TEMPLATE_TYPES.includes(projectState.activeTemplate)) projectState.activeTemplate = "single";
  if (!projectState.templates[projectState.activeTemplate]) projectState.templates[projectState.activeTemplate] = createTemplate();
  return projectState.templates[projectState.activeTemplate];
}

export function getTemplate(type) {
  return TEMPLATE_TYPES.includes(type) ? projectState.templates[type] : null;
}

export function getActivePage() {
  return getActiveTemplate().page;
}

export function getActiveElements() {
  return getActiveTemplate().elements;
}

export function templateHasContent(type) {
  const template = getTemplate(type);
  return Boolean(template && (template.elements.length || template.page.background?.fileName));
}

export function saveActiveTemplateView() {
  projectState.editor.templateViews[projectState.activeTemplate] = {
    zoom: projectState.editor.zoom,
    camera: { ...projectState.editor.camera }
  };
}

export function switchTemplate(type) {
  if (!TEMPLATE_TYPES.includes(type) || type === projectState.activeTemplate) return false;
  saveActiveTemplateView();
  projectState.activeTemplate = type;
  const view = projectState.editor.templateViews[type] || { zoom: 1, camera: { panX: 0, panY: 0 } };
  projectState.editor.zoom = Number.isFinite(Number(view.zoom)) ? Math.max(.1, Math.min(6, Number(view.zoom))) : 1;
  projectState.editor.camera = { panX: Number(view.camera?.panX) || 0, panY: Number(view.camera?.panY) || 0 };
  projectState.selection = { uids: [], anchorUid: null, lastUid: null };
  projectState.placement = { active: false, coreId: null };
  return true;
}

export function getSelectedElement() {
  return getActiveElements().find((element) => element.uid === projectState.selection.anchorUid) || null;
}

export function selectedElements() { return projectState.selection.uids.map((uid) => getActiveElements().find((element) => element.uid === uid)).filter(Boolean); }
export function setSelection(uids, lastUid = uids[uids.length - 1] || null) { const available = new Set(getActiveElements().map((element) => element.uid)); const ordered = [...new Set(uids)].filter((uid) => available.has(uid)); projectState.selection = { uids: ordered, anchorUid: ordered[0] || null, lastUid: lastUid && ordered.includes(lastUid) ? lastUid : ordered[ordered.length - 1] || null }; }
export function toggleSelection(uid) { const uids = projectState.selection.uids.includes(uid) ? projectState.selection.uids.filter((item) => item !== uid) : [...projectState.selection.uids, uid]; setSelection(uids, uid); }

export function createTextElement(index) {
  return {
    uid: `el_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`,
    elementClass: "custom",
    id: `text_${index}`,
    name: "Textfeld",
    type: "text",
    x: 20,
    y: 20,
    width: 55,
    height: 9,
    fontFamily: "Arial",
    fontSizePt: 9,
    fontWeight: "normal",
    align: "left",
    color: "#222222",
    multiline: false,
    testValue: "Beispieltext"
  };
}

export function createCoreElement(coreId, index) {
  const definitions = { invoice_ref: "Rechnungsnummer", invoice_date: "Rechnungsdatum" };
  return { ...createTextElement(index), uid: `el_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`, elementClass: "core", id: coreId, name: definitions[coreId] || coreId, width: 30, height: 5, testValue: definitions[coreId] || coreId };
}

function normalizePage(page = {}) {
  return {
    widthMm: PAGE_WIDTH_MM,
    heightMm: PAGE_HEIGHT_MM,
    background: { fileName: page.background?.fileName || "" }
  };
}

function normalizeTextElement(element, index, usedIds) {
  let elementClass = element.elementClass === "core" && ["invoice_ref", "invoice_date", "invoice_lines"].includes(element.id) ? "core" : "custom";
  const baseId = element.id || `text_${index + 1}`;
  let id = baseId; let suffix = 2;
  while (usedIds.has(id)) id = `${baseId}_${suffix++}`;
  usedIds.add(id);
  if (elementClass === "core" && id !== baseId) elementClass = "custom";
  const coreId = elementClass === "core" && ["invoice_ref", "invoice_date", "invoice_lines"].includes(baseId) ? baseId : null;

  if (element.type === "table") {
    const oldPadding = Number(element.cellPaddingMm) || 0;
    element.rowMode = element.rowMode === "dynamic" ? "dynamic" : "fixed";
    element.rowHeightMm = Number(element.rowHeightMm) || 7;
    element.minRowHeightMm = Number(element.minRowHeightMm) || element.rowHeightMm;
    element.cellPaddingHorizontalMm = Number.isFinite(Number(element.cellPaddingHorizontalMm)) ? Number(element.cellPaddingHorizontalMm) : oldPadding;
    element.cellPaddingVerticalMm = Number.isFinite(Number(element.cellPaddingVerticalMm)) ? Number(element.cellPaddingVerticalMm) : 0;
    element.lineHeight = Number(element.lineHeight) || 1.2;
    element.verticalAlign = ["top", "middle", "bottom"].includes(element.verticalAlign) ? element.verticalAlign : "middle";
    element.fontFamily = element.fontFamily || "Arial";
    element.fontSizePt = Number(element.fontSizePt) || 9;
    element.fontWeight = ["normal", "bold"].includes(element.fontWeight) ? element.fontWeight : "normal";
    element.color = element.color || "#222222";
    if (!Array.isArray(element.columns)) element.columns = createDefaultColumns(Number(element.width) || 190);
    normalizeTableColumns(element);
  }
  return { ...element, uid: element.uid || `el_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`, elementClass, id: coreId || id };
}

function normalizeElements(elements = []) {
  const usedIds = new Set();
  return (Array.isArray(elements) ? elements : []).map((element, index) => normalizeTextElement({ ...element }, index, usedIds));
}

function normalizeTemplate(template = {}) {
  return {
    page: normalizePage(template.page),
    elements: normalizeElements(template.elements)
  };
}

function templatesFromProject(nextProject) {
  const templates = createTemplates();
  if (nextProject.templates && typeof nextProject.templates === "object") {
    TEMPLATE_TYPES.forEach((type) => {
      templates[type] = normalizeTemplate(nextProject.templates[type]);
    });
    return templates;
  }
  templates.single = normalizeTemplate({ page: nextProject.page, elements: nextProject.elements });
  return templates;
}

export function replaceProject(nextProject) {
  projectState.version = 4;
  projectState.documentType = nextProject.documentType || "invoice";
  projectState.templates = templatesFromProject(nextProject);
  projectState.editor.gridMm = Number(nextProject.editor?.gridMm) || 1;
  projectState.editor.snapToGrid = nextProject.editor?.snapToGrid !== false;
  projectState.editor.gridVisible = nextProject.editor?.gridVisible !== false;
  projectState.editor.templateViews = { ...createTemplateViews(), ...(nextProject.editor?.templateViews || {}) };
  projectState.editor.backgroundDataUrls = {};
  projectState.editor.paginationRowCount = Number(nextProject.editor?.paginationRowCount) || 25;
  projectState.activeTemplate = TEMPLATE_TYPES.includes(nextProject.editor?.activeTemplate) ? nextProject.editor.activeTemplate : TEMPLATE_TYPES.includes(nextProject.activeTemplate) ? nextProject.activeTemplate : "single";
  const view = projectState.editor.templateViews[projectState.activeTemplate] || { zoom: nextProject.editor?.zoom || 1, camera: nextProject.editor?.camera || { panX: 0, panY: 0 } };
  projectState.editor.zoom = Number.isFinite(Number(view.zoom)) ? Math.max(.1, Math.min(6, Number(view.zoom))) : 1;
  projectState.editor.camera = { panX: Number(view.camera?.panX) || 0, panY: Number(view.camera?.panY) || 0 };
  projectState.placement = { active: false, coreId: null };
  projectState.selection = { uids: [], anchorUid: null, lastUid: null };
}
