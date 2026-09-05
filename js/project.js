import { projectState, replaceProject } from "./state.js";
import { downloadJson, readFileAsText } from "./utils.js";

function cleanElement(element) {
  const { showTestData, layoutResult, cellPaddingMm, ...documentElement } = element;
  return documentElement;
}

function validateProjectData(projectData) {
  if (!projectData || typeof projectData !== "object" || Array.isArray(projectData)) throw new Error("Ungültiges Projektformat: Projektdaten fehlen.");
  if (!Array.isArray(projectData.elements) && !projectData.templates) throw new Error("Ungültiges Projektformat: elements oder templates fehlt.");
  if (projectData.elements && (!Array.isArray(projectData.elements) || projectData.elements.some((element) => !element || typeof element !== "object" || Array.isArray(element)))) throw new Error("Ungültiges Projektformat: elements ist ungültig.");
  if (projectData.templates && (typeof projectData.templates !== "object" || Array.isArray(projectData.templates))) throw new Error("Ungültiges Projektformat: templates ist ungültig.");
  if (projectData.templates) Object.values(projectData.templates).forEach((template) => {
    if (template && (typeof template !== "object" || Array.isArray(template))) throw new Error("Ungültiges Projektformat: template ist ungültig.");
    if (template?.elements && (!Array.isArray(template.elements) || template.elements.some((element) => !element || typeof element !== "object" || Array.isArray(element)))) throw new Error("Ungültiges Projektformat: template elements ist ungültig.");
  });
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
export function restoreProjectData(projectData) { validateProjectData(projectData); replaceProject(projectData); }
export async function importProject(file) { const parsed = JSON.parse(await readFileAsText(file)); restoreProjectData(parsed); }
