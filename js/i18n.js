const STORAGE_KEY = "doliInvoiceCreator.language.v1";
const FALLBACK_LANGUAGE = "en";
let currentLanguage = FALLBACK_LANGUAGE;
let languages = [];
let translations = { en: {}, de: {} };
const listeners = new Set();
const missingKeys = new Set();
const EN_FIELD_PARTS = Object.freeze({
  mycompany: "Own company",
  company: "Company",
  myuser: "User",
  object: "Object",
  line: "Line",
  product: "Product",
  ref: "reference",
  date: "date",
  address: "address",
  zip: "ZIP code",
  town: "city",
  country: "country",
  name: "name",
  total: "total",
  ht: "net",
  vat: "VAT",
  ttc: "gross",
  payment: "payment",
  term: "terms",
  mode: "method",
  desc: "description",
  qty: "quantity",
  quantity: "quantity",
  unit: "unit",
  price: "price",
  tracking: "tracking",
  number: "number",
  current: "current",
  count: "total"
});

function getNested(value, path) {
  if (typeof path !== "string" || !path) return undefined;
  if (value && Object.prototype.hasOwnProperty.call(value, path)) return value[path];
  return path.split(".").reduce((result, part) => result?.[part], value);
}

function getString(language, key) {
  if (typeof key !== "string" || !key) return undefined;
  return getNested(translations[language]?.strings, key);
}

function getFieldEntry(field) {
  const pack = field.packId ? translations[currentLanguage]?.packs?.[field.packId] : null;
  const fallbackPack = field.packId ? translations[FALLBACK_LANGUAGE]?.packs?.[field.packId] : null;
  const code = field.sourceCode || field.id;
  return pack?.fields?.[code] || fallbackPack?.fields?.[code] || translations[currentLanguage]?.fields?.[field.id] || translations[FALLBACK_LANGUAGE]?.fields?.[field.id] || null;
}

function generatedEnglishFieldLabel(field) {
  return String(field.id || "field").split("_").map((part) => EN_FIELD_PARTS[part] || part).join(" ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function t(key, fallback = "") {
  if (typeof key !== "string" || !key) return fallback;
  const value = getString(currentLanguage, key) ?? getString(FALLBACK_LANGUAGE, key);
  if (value !== undefined) return value;
  if (!missingKeys.has(key)) { missingKeys.add(key); console.warn(`Missing translation key: ${key}`); }
  return fallback;
}

export function getLocalizedFieldLabel(field, documentType = null) {
  const entry = getFieldEntry(field);
  const fallback = currentLanguage === FALLBACK_LANGUAGE ? generatedEnglishFieldLabel(field) : field.label || field.id;
  return entry?.display?.[documentType] || entry?.label || getString(currentLanguage, `field.${field.id}`) || getString(FALLBACK_LANGUAGE, `field.${field.id}`) || fallback;
}

export function getLocalizedFieldSearchTerms(field, documentType = null) {
  const entry = getFieldEntry(field);
  return [getLocalizedFieldLabel(field, documentType), field.id, field.sourceCode, ...(entry?.aliases || [])].filter(Boolean);
}

export function getLocalizedPackName(pack) {
  return translations[currentLanguage]?.packs?.[pack.id]?.name || translations[FALLBACK_LANGUAGE]?.packs?.[pack.id]?.name || pack.name;
}

export function getLocalizedPackField(field, documentType = null) {
  return { ...field, label: getLocalizedFieldLabel(field, documentType), search: [...getLocalizedFieldSearchTerms(field, documentType), ...(field.searchKeys || [])] };
}

export function getLanguage() { return currentLanguage; }
export function getLanguages() { return Object.freeze([...languages]); }
export function onLanguageChange(listener) { listeners.add(listener); return () => listeners.delete(listener); }

function applyElementTranslation(element) {
  const key = element.dataset.i18n;
  if (key) {
    const fallback = element.dataset.i18nFallback || [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)?.textContent.trim() || element.textContent.trim();
    const text = t(key, fallback);
    const textNode = [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
    if (textNode) textNode.textContent = text;
    else element.textContent = text;
  }
  if (element.dataset.i18nPlaceholder) element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder, element.getAttribute("placeholder") || ""));
  if (element.dataset.i18nTitle) element.setAttribute("title", t(element.dataset.i18nTitle, element.getAttribute("title") || ""));
  if (element.dataset.i18nAriaLabel) element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel, element.getAttribute("aria-label") || ""));
}

export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n], [data-i18n-placeholder], [data-i18n-title], [data-i18n-aria-label]").forEach(applyElementTranslation);
  document.documentElement.lang = currentLanguage;
}

export function setLanguage(language) {
  if (!languages.some((item) => item.code === language)) language = FALLBACK_LANGUAGE;
  currentLanguage = language;
  try { localStorage.setItem(STORAGE_KEY, currentLanguage); } catch { }
  applyTranslations();
  listeners.forEach((listener) => listener(currentLanguage));
}

async function readJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

export async function initializeI18n() {
  try {
    const index = await readJson(new URL("../data/i18n/index.json", import.meta.url));
    languages = Array.isArray(index.languages) ? index.languages : [];
    const loaded = await Promise.all(languages.map(async (language) => {
      try { return [language.code, await readJson(new URL(`../data/i18n/${language.file}`, import.meta.url))]; }
      catch (error) { console.warn(`Translation file ${language.code} could not be loaded.`, error); return [language.code, {}]; }
    }));
    translations = { ...translations, ...Object.fromEntries(loaded) };
  } catch (error) {
    console.warn("Translations could not be loaded.", error);
    languages = [{ code: "de", name: "Deutsch", file: "de.json" }, { code: "en", name: "English", file: "en.json" }];
  }
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch { }
  const browserLanguage = navigator.language?.toLowerCase() || "";
  const initial = languages.some((item) => item.code === saved) ? saved : browserLanguage.startsWith("de") ? "de" : FALLBACK_LANGUAGE;
  currentLanguage = languages.some((item) => item.code === initial) ? initial : FALLBACK_LANGUAGE;
  applyTranslations();
  return currentLanguage;
}
