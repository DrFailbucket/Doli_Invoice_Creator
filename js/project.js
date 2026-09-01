import { projectState, replaceProject } from "./state.js";
import { downloadJson, readFileAsText } from "./utils.js";

function cleanElement(element) {
  const { showTestData, layoutResult, cellPaddingMm, ...documentElement } = element;
  return documentElement;
}

export function projectForExport() {
  return {
    version: 4,
    documentType: projectState.documentType,
    templates: Object.fromEntries(Object.entries(projectState.templates).map(([type, template]) => [type, {
      page: template.page,
      elements: template.elements.map(cleanElement)
    }])),
    editor: {
      gridMm: projectState.editor.gridMm,
      snapToGrid: projectState.editor.snapToGrid,
      gridVisible: projectState.editor.gridVisible,
      templateViews: projectState.editor.templateViews,
      activeTemplate: projectState.activeTemplate,
      paginationRowCount: projectState.editor.paginationRowCount
    }
  };
}
export function exportProject() { downloadJson("doli-invoice-project.json", projectForExport()); }
export async function importProject(file) { const parsed = JSON.parse(await readFileAsText(file)); if (!Array.isArray(parsed.elements) && !parsed.templates) throw new Error("Ungültiges Projektformat: elements oder templates fehlt."); replaceProject(parsed); }
