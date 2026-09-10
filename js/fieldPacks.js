const FIELD_PACK_INDEX_URL = new URL("../data/fieldpacks/index.json", import.meta.url);

function normalizeField(pack, definition) {
  const id = definition.source === "dolibarr_extrafield" && definition.code
    ? `object_options_${definition.code}`
    : definition.id;
  const label = definition.label || definition.name;
  if (!id || !label) throw new Error(`Felddefinition in Pack ${pack.id} ist unvollständig.`);
  const documentTypes = Array.isArray(definition.documentTypes) ? definition.documentTypes : [];
  if (!documentTypes.length) throw new Error(`Feld ${id} in Pack ${pack.id} hat keine Dokumenttypen.`);
  return Object.freeze({
    id,
    label,
    category: "industry",
    documentTypes: Object.freeze([...documentTypes]),
    source: definition.source || "fieldpack",
    recommended: false,
    search: Object.freeze(Array.isArray(definition.search) ? [...definition.search] : []),
    packId: pack.id,
    type: definition.type || "text"
  });
}

function normalizePack(pack, descriptor) {
  if (!pack || pack.version !== 1 || pack.id !== descriptor.id || !Array.isArray(pack.fields)) throw new Error(`Ungültiges Feld-Pack: ${descriptor.id}`);
  const seen = new Set();
  const fields = pack.fields.map((field) => normalizeField(pack, field)).filter((field) => {
    if (seen.has(field.id)) return false;
    seen.add(field.id);
    return true;
  });
  return Object.freeze({ id: pack.id, name: pack.name || descriptor.name, fields: Object.freeze(fields) });
}

async function readJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

export async function loadFieldPacks() {
  try {
    const index = await readJson(FIELD_PACK_INDEX_URL);
    if (!index || index.version !== 1 || !Array.isArray(index.packs)) throw new Error("Ungültiger Feld-Pack-Index.");
    const packs = [];
    for (const descriptor of index.packs) {
      try {
        const pack = await readJson(new URL(`../data/fieldpacks/${descriptor.file}`, import.meta.url));
        packs.push(normalizePack(pack, descriptor));
      } catch (error) {
        console.warn(`Feld-Pack ${descriptor.id} konnte nicht geladen werden.`, error);
      }
    }
    return Object.freeze(packs);
  } catch (error) {
    console.warn("Feld-Packs konnten nicht geladen werden.", error);
    return Object.freeze([]);
  }
}
