# Doli Invoice Creator

[English](README.md) | [Deutsch](README.de.md)

Browserbasierter visueller Template-Editor für Dolibarr-Dokumentlayouts. Doli Invoice Creator läuft lokal im Browser und benötigt für die Template-Erstellung kein Backend.

Der Creator erzeugt selbst keine Rechnungen und keine PDFs. Er erstellt Layoutdefinitionen und JSON-Templates, die von einem kompatiblen Dolibarr-PDF-Renderer oder -Modul verarbeitet werden können.

## Ausprobieren

# [Editor öffnen](https://drfailbucket.github.io/Doli_Invoice_Creator/)

## Zweck

Mit dem Editor lassen sich A4-Dokumentlayouts visuell gestalten, Dolibarr-Felder platzieren, eine Rechnungstabelle konfigurieren und Templates als JSON exportieren. Der Editor ist darauf ausgelegt, Dokumenttypen wie Rechnungen, Angebote, Aufträge und Lieferungen/Versand abzubilden, ohne Live-Dolibarr-Daten anzubinden.

## Funktionen

- Visueller A4-Editor mit Geometrie in Millimetern
- Lokale Hintergrundbilder
- Dolibarr-Feldbibliothek mit Core-Feldern, benutzerdefinierten Feldern, Aliasen und generischen Extrafeld-Mustern
- Feldsuche, Dokumenttyp-Filter, Empfehlungen und kontextabhängige Bezeichnungen
- Erweiterte/allgemeine Felder wie `customercontact`, `vatrate`, `mycompany_taxnumber`, `page_current` und `page_count`
- Editor für die Rechnungstabelle mit Spaltenbreiten, Ausrichtung, Umbruch und Zeilenlayout-Vorschau
- Unabhängige einseitige und mehrseitige Layout-Templates: `single`, `first`, `middle` und `last`
- Schriftart, Schriftgröße, Schriftschnitt, Textfarbe, Ausrichtung und mehrzeiliger Text
- Raster, Einrasten, Zoom und Canvas-Navigation/Pan
- Mehrfachauswahl, Ausrichten, Verteilen und Abstände
- Kopieren, Einfügen, Ausschneiden, Duplizieren, Rückgängig und Wiederholen
- JSON-Import und -Export
- Größenveränderbare Bereiche in der linken Sidebar
- Optionales lokales Autosave und Recovery

## Was der Creator nicht macht

- Er erzeugt selbst keine Rechnungen und keine PDFs.
- Er bindet keine Live-Dolibarr-Daten an.
- Er bietet kein Backend, kein Benutzerkonto und keinen Cloud-Projektspeicher.
- Er berechnet keine Laufzeit-Paginierung und entscheidet nicht, wie viele Seiten ein echtes Dokument benötigt.

## Funktionsweise

Der Creator definiert, wo Inhalte erscheinen: Templates, Hintergründe, Felder, Positionen, Größen, Formatierungen und Tabellengrößen. Ein separates Dolibarr-PDF-Renderer-Modul entscheidet, welche Laufzeitdaten angezeigt werden, und erzeugt das eigentliche PDF.

Der Creator unterstützt unabhängige einseitige und mehrseitige Layouts. Mehrseiten-Projekte verwenden getrennte Templates für erste Seite, Zwischenseite und letzte Seite. Die Zwischenseite dient als wiederverwendbare Vorlage für beliebig viele Zwischenseiten. Die tatsächliche Laufzeit-Paginierung übernimmt der PDF-Renderer; er entscheidet, ob `single` oder `first` + `middle` 0..N-mal + `last` verwendet wird, und erzeugt das eigentliche PDF.

Jedes Template unterstützt höchstens eine `invoice_lines`-Tabelle. Beim Kopieren zwischen Templates erhält jedes Element eine neue interne `uid`; semantische Feld-IDs bleiben erhalten.

## Aktueller Stand

Der aktuelle Creator- und Renderer-Kernbereich ist stabil und funktioniert für den dokumentierten Rechnungs-Workflow. Der Creator bietet ein- und mehrseitige Layoutbearbeitung, Feldmapping, Rechnungstabellen, JSON-Import/-Export und lokale Wiederherstellung. Es wird nicht behauptet, dass jedes mögliche Dolibarr-Feld unterstützt wird; dynamische Zeilen-Paginierung wird vom Renderer derzeit noch nicht unterstützt.

## Renderer

Der begleitende Dolibarr-PDF-Renderer verarbeitet das exportierte Template. Passt eine Rechnung auf eine Seite, verwendet er den Pfad `single`; andernfalls `first` + `middle` 0..N-mal + `last`. Er führt die Positionsnummerierung fortlaufend weiter, löst unterstützte Standard-, benutzerdefinierte und Extrafeld-IDs auf und unterstützt `page_current` / `page_count`.

Der Renderer berücksichtigt Feldkoordinaten und Formatierungen aus dem Creator, verwendet templatespezifische Hintergrundbilder und unterstützt derzeit Paginierung mit festen Zeilen. Der dynamische Zeilenmodus ist für die Layoutarbeit im Creator verfügbar, wird vom Renderer aber noch nicht unterstützt.

## Branchen-Feldpakete

Branchen-Feldpakete werden dynamisch aus `data/fieldpacks/index.json` geladen. Enthalten ist derzeit `Kfz / Werkstatt` mit `vehiclemodel`, `vehicleplate`, `vehiclevin`, `vehicleodometer` und `vehiclefirstregistration`. Ein Dolibarr-Extrafeld mit dem Code `vehicleplate` wird zu `object_options_vehicleplate`.

Für eine weitere Branche werden nur eine JSON-Datei und ein Eintrag im Index benötigt; eine JavaScript-Änderung ist nicht erforderlich. Ein minimales Paket enthält `version`, `id`, `name` und `fields`. Felder können eine direkte semantische `id` oder eine Dolibarr-Extrafeld-Definition verwenden, zum Beispiel:

```json
{
  "source": "dolibarr_extrafield",
  "code": "vehicleplate",
  "name": "Kennzeichen",
  "type": "text",
  "documentTypes": ["invoice"]
}
```

## Autosave und Recovery

Wenn aktiviert, speichert das Autosave das aktuelle Projekt nach einer kurzen Verzögerung im lokalen Browserspeicher. Beim Start wird ein vorhandenes Autosave ausdrücklich zur Wiederherstellung oder zum Verwerfen angeboten. Es gibt keinen Cloud- oder Backend-Speicher.

Binäre Daten von Hintergrundbildern werden absichtlich nicht im Autosave gespeichert. Nach einer Wiederherstellung bleiben Layout und platzierte Elemente erhalten; das lokale Hintergrundbild muss bei Bedarf erneut ausgewählt werden.

## Übersetzungen

Die Übersetzungen liegen in `data/i18n/`. Für eine weitere Sprache werden nur eine neue Übersetzungsdatei und ein Eintrag in `data/i18n/index.json` benötigt; JavaScript muss nicht geändert werden. Englisch ist der kanonische Fallback für fehlende Übersetzungen. Fehlt auch der englische Schlüssel, wird der vorhandene Standardtext verwendet.

## Hintergrundbilder

Jedes Template kann ein eigenes Hintergrundbild verwenden. Im exportierten JSON werden nur Dateiname bzw. Referenz-Metadaten gespeichert, nicht die Bilddaten selbst. Binärdaten von Hintergrundbildern sind auch im Autosave ausgeschlossen; nach Import oder Recovery muss das lokale Bild bei Bedarf erneut ausgewählt werden.

## Lokale Nutzung

Im Projektordner einen statischen Server starten:

```text
python -m http.server 8001
```

Danach [http://127.0.0.1:8001/](http://127.0.0.1:8001/) in einem modernen Browser öffnen.

## Projektstruktur

- `index.html`, `css/` und `js/` enthalten den Browser-Editor.
- `data/fieldpacks/` enthält dynamisch geladene Branchen-Feldpakete.
- `data/i18n/` enthält den JSON-Übersetzungskatalog und die Sprachdateien.
- `README.md` und `README.de.md` enthalten die öffentliche Projektdokumentation.

## Tastaturkürzel

| Kürzel | Aktion |
| --- | --- |
| Delete / Entf | Ausgewählte Elemente löschen |
| Ctrl + A | Alle Elemente auswählen |
| Ctrl + C / V | Kopieren / Einfügen |
| Ctrl + X | Ausschneiden |
| Ctrl + D | Duplizieren |
| Ctrl + Z | Rückgängig |
| Ctrl + Y / Ctrl + Shift + Z | Wiederholen |
| Escape | Platzierung abbrechen / Auswahl aufheben |
| Pfeiltasten | Um 0,1 mm bewegen |
| Shift + Pfeiltasten | Um 1 mm bewegen |

## Projektformat

Projekte verwenden das JSON-Schema Version 4. Die Layoutgeometrie wird in Millimetern gespeichert. Semantische Feld-IDs bleiben für Renderer-Mappings erhalten; jedes visuelle Element besitzt zusätzlich eine eigene interne `uid`. Hintergrundbilddateien werden nicht in das JSON eingebettet.

## Datenschutz

Der Editor läuft clientseitig und benötigt weder Konto noch Backend. Der Editor lädt keine Projekte hoch, verwendet keine Telemetrie und benötigt für den lokalen Betrieb keine Cloud-Abhängigkeit.

## Roadmap

- [x] Visueller einseitiger Template-Editor
- [x] Dolibarr-Feldregistry und Feldbibliothek
- [x] Editor für die Rechnungstabelle
- [x] JSON-Import/-Export
- [x] Lokales Autosave und Recovery
- [x] Workflow für Mehrseiten-Templates
- [ ] Weitere Dokumenttyp-Workflows
- [ ] Weitere UX- und Editor-Verbesserungen
