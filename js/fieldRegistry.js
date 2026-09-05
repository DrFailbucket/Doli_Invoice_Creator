import { DOCUMENT_TYPES } from "./state.js";

const ALL_DOCUMENT_TYPES = DOCUMENT_TYPES;
const CONTACT_DOCUMENT_TYPES = Object.freeze(["invoice", "proposal", "order"]);
const INVOICE_DOCUMENT_TYPES = Object.freeze(["invoice"]);
const PROPOSAL_DOCUMENT_TYPES = Object.freeze(["proposal"]);
const ORDER_DOCUMENT_TYPES = Object.freeze(["order"]);
const SHIPMENT_DOCUMENT_TYPES = Object.freeze(["shipment"]);
const COMMERCIAL_DOCUMENT_TYPES = Object.freeze(["invoice", "proposal", "order"]);
const RECOMMENDED_FIELDS_BY_DOCUMENT_TYPE = Object.freeze({
  invoice: Object.freeze([
    "object_ref",
    "object_date",
    "object_date_limit",
    "company_name",
    "company_address",
    "company_zip",
    "company_town",
    "company_country",
    "company_customercode",
    "invoice_lines",
    "object_total_ht",
    "object_total_vat",
    "object_total_ttc"
  ]),
  proposal: Object.freeze([
    "object_ref",
    "object_date",
    "object_date_end",
    "company_name",
    "company_address",
    "company_zip",
    "company_town",
    "company_country",
    "company_customercode",
    "invoice_lines",
    "object_total_ht",
    "object_total_vat",
    "object_total_ttc"
  ]),
  order: Object.freeze([
    "object_ref",
    "object_date",
    "object_date_delivery_planed",
    "company_name",
    "company_address",
    "company_zip",
    "company_town",
    "company_country",
    "company_customercode",
    "invoice_lines",
    "object_total_ht",
    "object_total_vat",
    "object_total_ttc"
  ]),
  shipment: Object.freeze([
    "object_ref",
    "object_date",
    "order_ref",
    "object_date_delivery",
    "object_tracking_number",
    "company_name",
    "company_address",
    "company_zip",
    "company_town",
    "company_country",
    "company_customercode",
    "invoice_lines"
  ])
});

const FIELD_DISPLAY_LABEL_OVERRIDES = Object.freeze({
  invoice: Object.freeze({
    object_ref: "Rechnungsnummer",
    object_date: "Rechnungsdatum",
    company_name: "Kundenname / Firma",
    company_customercode: "Kundennummer"
  }),
  proposal: Object.freeze({
    object_ref: "Angebotsnummer",
    object_date: "Angebotsdatum",
    company_name: "Kundenname / Firma",
    company_customercode: "Kundennummer"
  }),
  order: Object.freeze({
    object_ref: "Auftragsnummer",
    object_date: "Auftragsdatum",
    company_name: "Kundenname / Firma",
    company_customercode: "Kundennummer"
  }),
  shipment: Object.freeze({
    object_ref: "Lieferschein-/Versandnummer",
    object_date: "Versanddatum",
    company_name: "Empfänger / Firma",
    company_customercode: "Kundennummer"
  })
});

function dolibarrField(id, label, category, documentTypes = ALL_DOCUMENT_TYPES, recommended = false) {
  return {
    id,
    label,
    category,
    documentTypes,
    source: "dolibarr",
    recommended
  };
}

function dolibarrFields(category, entries, documentTypes = ALL_DOCUMENT_TYPES) {
  return entries.map(([id, label, recommended = false]) => dolibarrField(id, label, category, documentTypes, recommended));
}

function dolibarrPattern(pattern, label, category, documentTypes = ALL_DOCUMENT_TYPES) {
  return {
    pattern,
    label,
    category,
    documentTypes,
    source: "dolibarr"
  };
}

const FIELD_DEFINITIONS = [
  {
    id: "invoice_lines",
    label: "Positionstabelle",
    category: "lines",
    documentTypes: ALL_DOCUMENT_TYPES,
    source: "creator",
    recommended: ALL_DOCUMENT_TYPES
  },
  ...dolibarrFields("mycompany", [
    ["mycompany_logo", "Eigenes Firmenlogo"],
    ["mycompany_name", "Eigener Firmenname", ALL_DOCUMENT_TYPES],
    ["mycompany_address", "Eigene Firmenadresse"],
    ["mycompany_zip", "Eigene Postleitzahl"],
    ["mycompany_town", "Eigener Ort"],
    ["mycompany_country", "Eigenes Land"],
    ["mycompany_country_code", "Eigenes Landeskürzel"],
    ["mycompany_state", "Eigener Bundesstaat"],
    ["mycompany_state_code", "Eigenes Bundesstaat-Kürzel"],
    ["mycompany_managers", "Geschäftsführung"],
    ["mycompany_phone", "Eigene Telefonnummer"],
    ["mycompany_fax", "Eigene Faxnummer"],
    ["mycompany_email", "Eigene E-Mail"],
    ["mycompany_web", "Eigene Website"],
    ["mycompany_barcode", "Eigener Barcode"],
    ["mycompany_capital", "Eigenes Kapital"],
    ["mycompany_juridicalstatus", "Eigene Rechtsform"],
    ["mycompany_idprof1", "Eigene Berufs-ID 1"],
    ["mycompany_idprof2", "Eigene Berufs-ID 2"],
    ["mycompany_idprof3", "Eigene Berufs-ID 3"],
    ["mycompany_idprof4", "Eigene Berufs-ID 4"],
    ["mycompany_idprof5", "Eigene Berufs-ID 5"],
    ["mycompany_idprof6", "Eigene Berufs-ID 6"],
    ["mycompany_vatnumber", "Eigene USt-IdNr."],
    ["mycompany_object", "Eigener Unternehmenszweck"],
    ["mycompany_note_private", "Eigene interne Notiz"]
  ]),
  ...dolibarrFields("company", [
    ["company_name", "Firmenname", ALL_DOCUMENT_TYPES],
    ["company_name_alias", "Firmenalias"],
    ["company_address", "Firmenadresse"],
    ["company_zip", "Postleitzahl"],
    ["company_town", "Ort"],
    ["company_country", "Land"],
    ["company_country_code", "Landeskürzel"],
    ["company_state", "Bundesstaat"],
    ["company_state_code", "Bundesstaat-Kürzel"],
    ["company_phone", "Telefonnummer"],
    ["company_fax", "Faxnummer"],
    ["company_email", "E-Mail"],
    ["company_web", "Website"],
    ["company_barcode", "Barcode"],
    ["company_customercode", "Kundencode"],
    ["company_suppliercode", "Lieferantencode"],
    ["company_customeraccountancycode", "Debitorenkonto"],
    ["company_supplieraccountancycode", "Kreditorenkonto"],
    ["company_capital", "Kapital"],
    ["company_juridicalstatus", "Rechtsform"],
    ["company_outstanding_limit", "Kreditlimit"],
    ["company_idprof1", "Berufs-ID 1"],
    ["company_idprof2", "Berufs-ID 2"],
    ["company_idprof3", "Berufs-ID 3"],
    ["company_idprof4", "Berufs-ID 4"],
    ["company_idprof5", "Berufs-ID 5"],
    ["company_idprof6", "Berufs-ID 6"],
    ["company_vatnumber", "USt-IdNr."],
    ["company_note_public", "Öffentliche Firmennotiz"],
    ["company_note_private", "Interne Firmennotiz"],
    ["company_default_bank_iban", "Standard-IBAN"],
    ["company_default_bank_bic", "Standard-BIC"]
  ]),
  ...dolibarrFields("user", [
    ["myuser_lastname", "Benutzer-Nachname"],
    ["myuser_firstname", "Benutzer-Vorname"],
    ["myuser_fullname", "Benutzer-Vollname"],
    ["myuser_phone", "Benutzer-Telefon"],
    ["myuser_fax", "Benutzer-Fax"],
    ["myuser_mobile", "Benutzer-Mobilnummer"],
    ["myuser_address", "Benutzer-Adresse"],
    ["myuser_login", "Benutzer-Login"],
    ["myuser_email", "Benutzer-E-Mail"],
    ["myuser_zip", "Benutzer-Postleitzahl"],
    ["myuser_town", "Benutzer-Ort"],
    ["myuser_country", "Benutzer-Land"],
    ["myuser_country_code", "Benutzer-Landeskürzel"],
    ["myuser_state", "Benutzer-Bundesstaat"],
    ["myuser_state_code", "Benutzer-Bundesstaat-Kürzel"],
    ["myuser_logo", "Benutzer-Logo"],
    ["myuser_job", "Benutzer-Position"],
    ["myuser_web", "Benutzer-Website"]
  ]),
  ...dolibarrFields("common object", [
    ["object_id", "Objekt-ID"],
    ["object_ref", "Objekt-Referenz", ALL_DOCUMENT_TYPES],
    ["object_ref_ext", "Externe Objekt-Referenz"],
    ["object_label", "Objekt-Bezeichnung"],
    ["object_ref_customer", "Kundenreferenz"],
    ["object_ref_supplier", "Lieferantenreferenz"],
    ["object_note_private", "Interne Objektnotiz"],
    ["object_note_public", "Öffentliche Objektnotiz"],
    ["object_note", "Objektnotiz"],
    ["object_date", "Objektdatum", ALL_DOCUMENT_TYPES],
    ["object_total_ht", "Gesamt netto"],
    ["object_total_vat", "Gesamt USt."],
    ["object_total_localtax1", "Gesamt lokale Steuer 1"],
    ["object_total_localtax2", "Gesamt lokale Steuer 2"],
    ["object_total_ttc", "Gesamt brutto", COMMERCIAL_DOCUMENT_TYPES],
    ["object_total_discount_ht", "Rabatt gesamt netto"],
    ["object_total_ht_locale", "Gesamt netto lokalisiert"],
    ["object_total_vat_locale", "Gesamt USt. lokalisiert"],
    ["object_total_localtax1_locale", "Gesamt lokale Steuer 1 lokalisiert"],
    ["object_total_localtax2_locale", "Gesamt lokale Steuer 2 lokalisiert"],
    ["object_total_ttc_locale", "Gesamt brutto lokalisiert"],
    ["object_total_discount_ht_locale", "Rabatt gesamt netto lokalisiert"],
    ["object_multicurrency_code", "Fremdwährungs-Code"],
    ["object_multicurrency_tx", "Fremdwährungs-Kurs"],
    ["object_multicurrency_total_ht", "Fremdwährung gesamt netto"],
    ["object_multicurrency_total_tva", "Fremdwährung gesamt USt."],
    ["object_multicurrency_total_ttc", "Fremdwährung gesamt brutto"],
    ["object_multicurrency_total_ht_locale", "Fremdwährung gesamt netto lokalisiert"],
    ["object_multicurrency_total_tva_locale", "Fremdwährung gesamt USt. lokalisiert"],
    ["object_multicurrency_total_ttc_locale", "Fremdwährung gesamt brutto lokalisiert"],
    ["object_project_ref", "Projekt-Referenz"],
    ["object_project_title", "Projekt-Titel"],
    ["object_project_description", "Projekt-Beschreibung"],
    ["object_project_date_start", "Projekt-Startdatum"],
    ["object_project_date_end", "Projekt-Enddatum"],
    ["object_product_ref", "Produkt-Referenz"],
    ["object_product_label", "Produkt-Bezeichnung"]
  ]),
  ...dolibarrFields("invoice", [
    ["object_date_limit", "Fälligkeitsdatum", INVOICE_DOCUMENT_TYPES],
    ["object_payment_mode", "Zahlungsart"],
    ["object_payment_mode_code", "Zahlungsart-Code"],
    ["object_payment_term", "Zahlungsbedingung"],
    ["object_payment_term_code", "Zahlungsbedingung-Code"],
    ["object_incoterms", "Incoterms"],
    ["object_bank_iban", "Bankverbindung IBAN"],
    ["object_bank_bic", "Bankverbindung BIC"],
    ["object_bank_label", "Bankbezeichnung"],
    ["object_bank_number", "Bankkontonummer"],
    ["object_bank_proprio", "Kontoinhaber"],
    ["object_source_invoice_ref", "Ursprungsrechnung"],
    ["object_already_payed", "Bereits bezahlt"],
    ["object_already_deposit", "Bereits angezahlt"],
    ["object_already_creditnote", "Bereits gutgeschrieben"],
    ["object_already_payed_all", "Bereits bezahlt gesamt"],
    ["object_remain_to_pay", "Offener Betrag"],
    ["object_already_payed_locale", "Bereits bezahlt lokalisiert"],
    ["object_already_deposit_locale", "Bereits angezahlt lokalisiert"],
    ["object_already_creditnote_locale", "Bereits gutgeschrieben lokalisiert"],
    ["object_already_payed_all_locale", "Bereits bezahlt gesamt lokalisiert"],
    ["object_remain_to_pay_locale", "Offener Betrag lokalisiert"]
  ], INVOICE_DOCUMENT_TYPES),
  ...dolibarrFields("proposal", [
    ["object_date_end", "Gültig bis", PROPOSAL_DOCUMENT_TYPES],
    ["object_availability_id", "Verfügbarkeits-ID"],
    ["object_availability_code", "Verfügbarkeits-Code"],
    ["object_availability", "Verfügbarkeit"]
  ], PROPOSAL_DOCUMENT_TYPES),
  ...dolibarrFields("order", [
    ["object_date_delivery_planed", "Geplantes Lieferdatum", ORDER_DOCUMENT_TYPES]
  ], ORDER_DOCUMENT_TYPES),
  ...dolibarrFields("shipment", [
    ["object_date_delivery", "Lieferdatum", SHIPMENT_DOCUMENT_TYPES],
    ["object_hour_delivery", "Lieferuhrzeit"],
    ["object_tracking_number", "Sendungsnummer", SHIPMENT_DOCUMENT_TYPES],
    ["object_tracking_url", "Sendungsverfolgungs-URL"],
    ["object_shipping_method", "Versandart"],
    ["object_weight", "Gewicht"],
    ["object_width", "Breite"],
    ["object_height", "Höhe"],
    ["object_depth", "Tiefe"],
    ["object_size", "Größe"],
    ["order_ref", "Ursprungsauftrag", SHIPMENT_DOCUMENT_TYPES],
    ["order_ref_customer", "Kundenreferenz des Ursprungsauftrags"]
  ], SHIPMENT_DOCUMENT_TYPES),
  ...dolibarrFields("line", [
    ["line_pos", "Positionsnummer"],
    ["line_desc", "Positionsbeschreibung"],
    ["line_product_ref", "Produkt-Referenz"],
    ["line_product_ref_fourn", "Lieferanten-Produktreferenz"],
    ["line_product_label", "Produkt-Bezeichnung"],
    ["line_product_desc", "Produkt-Beschreibung"],
    ["line_product_type", "Produkttyp"],
    ["line_product_barcode", "Produkt-Barcode"],
    ["line_vatrate", "USt.-Satz"],
    ["line_localtax1_rate", "Lokale Steuer 1 Satz"],
    ["line_localtax2_rate", "Lokale Steuer 2 Satz"],
    ["line_up", "Einzelpreis"],
    ["line_up_locale", "Einzelpreis lokalisiert"],
    ["line_qty", "Menge"],
    ["line_discount_percent", "Rabatt in Prozent"],
    ["line_price_ht", "Positionsbetrag netto"],
    ["line_price_ht_locale", "Positionsbetrag netto lokalisiert"],
    ["line_price_vat", "Positions-USt."],
    ["line_price_vat_locale", "Positions-USt. lokalisiert"],
    ["line_price_ttc", "Positionsbetrag brutto"],
    ["line_price_ttc_locale", "Positionsbetrag brutto lokalisiert"],
    ["line_date_start", "Positions-Startdatum"],
    ["line_date_start_locale", "Positions-Startdatum lokalisiert"],
    ["line_date_start_rfc", "Positions-Startdatum RFC"],
    ["line_date_end", "Positions-Enddatum"],
    ["line_date_end_locale", "Positions-Enddatum lokalisiert"],
    ["line_date_end_rfc", "Positions-Enddatum RFC"],
    ["line_unit", "Einheit"],
    ["line_unit_short", "Einheit kurz"],
    ["line_fulldesc", "Vollständige Positionsbeschreibung"],
    ["line_multicurrency_code", "Positions-Fremdwährungs-Code"],
    ["line_multicurrency_subprice", "Positions-Fremdwährungs-Einzelpreis"],
    ["line_multicurrency_total_ht", "Positions-Fremdwährung netto"],
    ["line_multicurrency_total_tva", "Positions-Fremdwährung USt."],
    ["line_multicurrency_total_ttc", "Positions-Fremdwährung brutto"],
    ["line_multicurrency_subprice_locale", "Positions-Fremdwährungs-Einzelpreis lokalisiert"],
    ["line_multicurrency_total_ht_locale", "Positions-Fremdwährung netto lokalisiert"],
    ["line_multicurrency_total_tva_locale", "Positions-Fremdwährung USt. lokalisiert"],
    ["line_multicurrency_total_ttc_locale", "Positions-Fremdwährung brutto lokalisiert"]
  ]),
  ...dolibarrFields("line", [
    ["line_qty_shipped", "Versendete Menge"],
    ["line_qty_asked", "Angefragte Menge"],
    ["line_weight", "Positionsgewicht"],
    ["line_length", "Positionslänge"],
    ["line_surface", "Positionsfläche"],
    ["line_volume", "Positionsvolumen"]
  ], SHIPMENT_DOCUMENT_TYPES),
  {
    id: "page_current",
    label: "Aktuelle Seite",
    category: "system",
    documentTypes: ALL_DOCUMENT_TYPES,
    source: "renderer",
    recommended: false
  },
  {
    id: "page_count",
    label: "Seiten gesamt",
    category: "system",
    documentTypes: ALL_DOCUMENT_TYPES,
    source: "renderer",
    recommended: false
  }
];

const PATTERN_DEFINITIONS = [
  dolibarrPattern("company_options_xxx", "Drittpartei-Zusatzfeld", "company"),
  dolibarrPattern("contact_options_xxx", "Kontakt-Zusatzfeld", "contact", CONTACT_DOCUMENT_TYPES),
  dolibarrPattern("myuser_options_xxx", "Benutzer-Zusatzfeld", "user"),
  dolibarrPattern("object_options_xxx", "Objekt-Zusatzfeld", "common object"),
  dolibarrPattern("line_options_xxx", "Positions-Zusatzfeld", "line"),
  dolibarrPattern("line_product_options_xxx", "Produkt-Zusatzfeld der Position", "line")
];

function freezeField(field) {
  const recommendedTypes = DOCUMENT_TYPES.filter((type) => RECOMMENDED_FIELDS_BY_DOCUMENT_TYPE[type]?.includes(field.id));
  const recommended = recommendedTypes.length ? Object.freeze(recommendedTypes) : false;
  return Object.freeze({ ...field, documentTypes: Object.freeze([...field.documentTypes]), recommended });
}

function freezePattern(pattern) {
  return Object.freeze({ ...pattern, documentTypes: Object.freeze([...pattern.documentTypes]) });
}

export const FIELD_REGISTRY = Object.freeze(FIELD_DEFINITIONS.map(freezeField));
export const FIELD_PATTERN_REGISTRY = Object.freeze(PATTERN_DEFINITIONS.map(freezePattern));

const FIELD_BY_ID = new Map(FIELD_REGISTRY.map((field) => [field.id, field]));

export function getFieldById(id) {
  return FIELD_BY_ID.get(id) || null;
}

export function getFieldsForDocumentType(type) {
  return Object.freeze(FIELD_REGISTRY.filter((field) => field.documentTypes.includes(type)));
}

export function getFieldsByCategory(category) {
  return Object.freeze(FIELD_REGISTRY.filter((field) => field.category === category));
}

export function getRecommendedFieldsForDocumentType(type) {
  return Object.freeze(getFieldsForDocumentType(type).filter((field) => {
    if (Array.isArray(field.recommended)) return field.recommended.includes(type);
    return field.recommended === true;
  }));
}

export function getFieldDisplayLabel(field, documentType) {
  return FIELD_DISPLAY_LABEL_OVERRIDES[documentType]?.[field.id] || field.label;
}

export function getPatternsForDocumentType(type) {
  return Object.freeze(FIELD_PATTERN_REGISTRY.filter((pattern) => pattern.documentTypes.includes(type)));
}

export function getPatternsByCategory(category) {
  return Object.freeze(FIELD_PATTERN_REGISTRY.filter((pattern) => pattern.category === category));
}
