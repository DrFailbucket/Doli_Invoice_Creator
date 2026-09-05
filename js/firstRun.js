const FIRST_RUN_STORAGE_KEY = "doli_invoice_creator.first_run.v1";
const COMPLETED_VALUE = "completed";

function readFirstRunMarker() {
  try {
    if (!globalThis.localStorage) return null;
    return globalThis.localStorage.getItem(FIRST_RUN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeFirstRunMarker(value) {
  try {
    if (globalThis.localStorage) globalThis.localStorage.setItem(FIRST_RUN_STORAGE_KEY, value);
  } catch {
  }
}

function removeFirstRunMarker() {
  try {
    if (globalThis.localStorage) globalThis.localStorage.removeItem(FIRST_RUN_STORAGE_KEY);
  } catch {
  }
}

export function isFirstRun() {
  return readFirstRunMarker() !== COMPLETED_VALUE;
}

export function completeFirstRun() {
  writeFirstRunMarker(COMPLETED_VALUE);
  return false;
}

export function resetFirstRun() {
  removeFirstRunMarker();
  return true;
}
