const DEFAULT_SETTINGS = Object.freeze({
  gridMm: 1,
  snapToGrid: true,
  gridVisible: true,
  autosaveEnabled: false,
  recoveryEnabled: false
});
const SETTINGS_STORAGE_KEY = "doli_invoice_creator.settings.v1";

function readStoredSettings() {
  try {
    if (!globalThis.localStorage) return null;
    const stored = globalThis.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function persistSettings() {
  try {
    if (globalThis.localStorage) globalThis.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
  }
}

let settings = normalizeSettings(readStoredSettings(), DEFAULT_SETTINGS);

function normalizeSettings(partial = {}, base = settings) {
  const source = partial && typeof partial === "object" && !Array.isArray(partial) ? partial : {};
  const gridMm = Number(source.gridMm);
  return {
    gridMm: Number.isFinite(gridMm) && gridMm > 0 ? gridMm : base.gridMm,
    snapToGrid: typeof source.snapToGrid === "boolean" ? source.snapToGrid : base.snapToGrid,
    gridVisible: typeof source.gridVisible === "boolean" ? source.gridVisible : base.gridVisible,
    autosaveEnabled: typeof source.autosaveEnabled === "boolean" ? source.autosaveEnabled : base.autosaveEnabled,
    recoveryEnabled: typeof source.recoveryEnabled === "boolean" ? source.recoveryEnabled : base.recoveryEnabled
  };
}

export function getSettings() {
  return Object.freeze({ ...settings });
}

export function updateSettings(partial) {
  settings = normalizeSettings(partial);
  persistSettings();
  return getSettings();
}

export function resetSettings() {
  settings = { ...DEFAULT_SETTINGS };
  persistSettings();
  return getSettings();
}
