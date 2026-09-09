import { getSettings } from "./settings.js";
import { projectForExport, restoreProjectData, validateProjectData } from "./project.js";

export const AUTOSAVE_STORAGE_KEY = "doliInvoiceCreator.autosave.v1";
export const AUTOSAVE_DEBOUNCE_MS = 1000;

let autosaveTimer = null;

function readAutosaveEnvelope() {
  try {
    if (!globalThis.localStorage) return null;
    const raw = globalThis.localStorage.getItem(AUTOSAVE_STORAGE_KEY);
    if (!raw) return null;
    const envelope = JSON.parse(raw);
    if (!envelope || typeof envelope !== "object" || envelope.version !== 1 || !envelope.projectData || typeof envelope.projectData !== "object" || (!Array.isArray(envelope.projectData.elements) && (!envelope.projectData.templates || typeof envelope.projectData.templates !== "object"))) {
      globalThis.localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
      return null;
    }
    validateProjectData(envelope.projectData);
    return envelope;
  } catch (error) {
    try { globalThis.localStorage?.removeItem(AUTOSAVE_STORAGE_KEY); } catch { }
    console.warn("Autosave konnte nicht gelesen werden.", error);
    return null;
  }
}

export function hasAutosave() {
  return Boolean(readAutosaveEnvelope());
}

export function discardAutosave() {
  cancelAutosave();
  try { globalThis.localStorage?.removeItem(AUTOSAVE_STORAGE_KEY); } catch (error) { console.warn("Autosave konnte nicht verworfen werden.", error); }
}

function saveAutosave() {
  if (!getSettings().autosaveEnabled) return false;
  try {
    if (!globalThis.localStorage) return false;
    const projectData = projectForExport();
    const serialized = JSON.stringify({ version: 1, savedAt: new Date().toISOString(), projectData });
    globalThis.localStorage?.setItem(AUTOSAVE_STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    console.warn("Autosave fehlgeschlagen.", error);
    return false;
  }
}

export function scheduleAutosave() {
  if (!getSettings().autosaveEnabled) return;
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    autosaveTimer = null;
    saveAutosave();
  }, AUTOSAVE_DEBOUNCE_MS);
}

export function flushAutosave() {
  if (!autosaveTimer) return false;
  clearTimeout(autosaveTimer);
  autosaveTimer = null;
  return saveAutosave();
}

export function cancelAutosave() {
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = null;
}

export function restoreAutosave() {
  const envelope = readAutosaveEnvelope();
  if (!envelope) return false;
  try {
    restoreProjectData(envelope.projectData);
    discardAutosave();
    return true;
  } catch (error) {
    console.warn("Autosave konnte nicht wiederhergestellt werden.", error);
    discardAutosave();
    return false;
  }
}
