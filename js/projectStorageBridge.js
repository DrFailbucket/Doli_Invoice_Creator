import { projectForExport, restoreProjectData } from "./project.js";

function cloneProjectData(projectData) {
  return typeof structuredClone === "function" ? structuredClone(projectData) : JSON.parse(JSON.stringify(projectData));
}

export function serializeCurrentProjectData() {
  return projectForExport();
}

export function createProjectStorageRecord(id, name) {
  return {
    id,
    name,
    projectData: serializeCurrentProjectData()
  };
}

export function restoreStoredProjectData(projectData) {
  restoreProjectData(cloneProjectData(projectData));
}

export function restoreProjectStorageRecord(record) {
  if (!record || typeof record !== "object") throw new Error("Projekt-Datensatz fehlt.");
  restoreStoredProjectData(record.projectData);
}
