export const PROJECT_DB_NAME = "doli_invoice_creator_projects";
export const PROJECT_DB_VERSION = 1;
export const PROJECT_STORE_NAME = "projects";

function storageError(message, cause) {
  const error = new Error(message);
  error.cause = cause;
  return error;
}

function cloneProjectData(projectData) {
  return typeof structuredClone === "function" ? structuredClone(projectData) : JSON.parse(JSON.stringify(projectData));
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(storageError("IndexedDB ist nicht verfügbar."));
      return;
    }
    const request = globalThis.indexedDB.open(PROJECT_DB_NAME, PROJECT_DB_VERSION);
    request.onerror = () => reject(storageError("Projekt-Datenbank konnte nicht geöffnet werden.", request.error));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROJECT_STORE_NAME)) db.createObjectStore(PROJECT_STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function withStore(mode, operation) {
  return openDatabase().then((db) => new Promise((resolve, reject) => {
    const transaction = db.transaction(PROJECT_STORE_NAME, mode);
    const store = transaction.objectStore(PROJECT_STORE_NAME);
    let operationResult;
    transaction.onerror = () => reject(storageError("Projekt-Speicheroperation fehlgeschlagen.", transaction.error));
    transaction.onabort = () => reject(storageError("Projekt-Speicheroperation wurde abgebrochen.", transaction.error));
    transaction.oncomplete = () => {
      db.close();
      resolve(operationResult);
    };
    try {
      operationResult = operation(store);
    } catch (error) {
      transaction.abort();
      reject(storageError("Projekt-Speicheroperation konnte nicht ausgeführt werden.", error));
    }
  }));
}

function requestResult(request, notFoundValue = null) {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? notFoundValue);
  });
}

function nowIso() {
  return new Date().toISOString();
}

function createProjectRecord(record, existing = null) {
  if (!record || typeof record !== "object") throw storageError("Projekt-Datensatz fehlt.");
  if (!record.id) throw storageError("Projekt-Datensatz benötigt eine id.");
  if (!record.projectData || typeof record.projectData !== "object") throw storageError("Projekt-Datensatz benötigt projectData.");
  const timestamp = nowIso();
  return {
    id: String(record.id),
    name: String(record.name || existing?.name || "Unbenanntes Projekt"),
    createdAt: existing?.createdAt || record.createdAt || timestamp,
    updatedAt: timestamp,
    projectData: cloneProjectData(record.projectData)
  };
}

export async function saveProject(record) {
  try {
    const existing = await getProject(record?.id);
    const projectRecord = createProjectRecord(record, existing);
    await withStore("readwrite", (store) => requestResult(store.put(projectRecord)));
    return projectRecord;
  } catch (error) {
    throw storageError("Projekt konnte nicht gespeichert werden.", error);
  }
}

export async function getProject(id) {
  if (!id) return null;
  try {
    return await withStore("readonly", (store) => requestResult(store.get(String(id))));
  } catch (error) {
    throw storageError("Projekt konnte nicht gelesen werden.", error);
  }
}

export async function listProjects() {
  try {
    const projects = await withStore("readonly", (store) => requestResult(store.getAll(), []));
    return projects.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  } catch (error) {
    throw storageError("Projektliste konnte nicht gelesen werden.", error);
  }
}

export async function deleteProject(id) {
  if (!id) return false;
  try {
    const existing = await getProject(id);
    if (!existing) return false;
    await withStore("readwrite", (store) => requestResult(store.delete(String(id))));
    return true;
  } catch (error) {
    throw storageError("Projekt konnte nicht gelöscht werden.", error);
  }
}
