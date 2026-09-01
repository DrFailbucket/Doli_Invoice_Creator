# Doli Invoice Creator

#[OPEN EDITOR](https://drfailbucket.github.io/Doli_Invoice_Creator/)

Lokales Open-Source-Browser-Tool zum visuellen Erstellen von Layout-Mappings für Dolibarr-PDF-Dokumente.

## Entwicklungsstand

Phase 1.4 schließt die eingefrorene Phase 1 ab. Der Visual Mapper für eine einzelne A4-Seite enthält Hintergrundbilder, Textfelder, Raster, Zoom, freie Canvas-Navigation, Placement Mode, Multi-Selection, Alignment, gleichmäßige Distribution, frei definierbare Abstände in Millimetern, Clipboard, Shortcuts, Undo/Redo sowie JSON-Import und -Export. Es gibt kein Backend, keine Datenbank, keine Cloud, keine Accounts und keine Telemetrie.

Phase 3 ergänzt den Multi-Page Template Manager und eine Pagination-Simulation. Ein Projekt enthält vier Template-Typen: `single`, `first`, `middle` und `last`. Jedes Template besitzt eigene Seitendaten, einen eigenen Hintergrund und eigene Elemente. Core-IDs sind template-lokal; `invoice_lines` darf also je einmal in `single`, `first`, `middle` und `last` existieren. Die bestehende Row Layout Engine bleibt die einzige Quelle für Positionshöhen. Die neue Pagination Engine entscheidet nur, welche Rows auf welches Seitentemplate passen, und exportiert JSON Schema Version 4. Echte Rechnungsdaten, PDF-Ausgabe, Summenfelder, Seitenzahl-Core-Felder, Backend und Autosave sind weiterhin nicht enthalten.

## Lokale Nutzung

Im Projektordner einen statischen Server starten, zum Beispiel:

```text
py -m http.server 8000
```

Danach `http://localhost:8000` im modernen Chrome, Edge oder Firefox öffnen. Das Projekt kann vollständig offline genutzt werden.

## Struktur

- `index.html`: Anwendungsshell und UI
- `css/app.css`: Dark-Editor-Oberfläche
- `js/state.js`: zentraler Projektzustand und Datenmodell
- `js/coordinates.js`: einzige Canvas-Pixel/Millimeter-Umrechnung
- `js/canvas.js`: Seitendarstellung und Text-Rendering
- `js/elements.js`: Erzeugen, Verschieben und Skalieren von Elementen
- `js/textMeasure.js`: zoom-unabhängige Textmessung im Browser
- `js/rowLayout.js`: Positionshöhen, Fit/Overflow und Pagination-Vorbereitung
- `js/tables.js`: Tabellenstruktur, Spaltengeometrie und Testdaten
- `js/pagination.js`: Single-vs-Multi-Entscheidung und First/Middle/Last-Pagination
- `js/properties.js`: Eigenschaftenpanel
- `js/project.js`: JSON-Import und -Export
- `js/app.js`: Ereignisse und Zusammenschaltung

Die Arbeitsfläche ist ein eigener, scrollbarer Viewport. Normales Mausrad scrollt vertikal, Shift + Mausrad horizontal, Ctrl + Mausrad zoomt die Seite zum Mauszeiger. Die mittlere Maustaste pannt frei in beide Richtungen. Diese Navigation wird nicht im Projektzustand gespeichert.

Ein Klick auf eine freie Dokumentfläche hebt die Auswahl auf. Fit-to-window berechnet den passenden Zoom und zentriert die Seite. Mehrere Elemente können am Anchor ausgerichtet, gleichmäßig verteilt oder mit einem festen Abstand in Millimetern angeordnet werden. Middle-Mouse-Panning hat Vorrang vor Elementinteraktion.

## Tabellenlayout

`invoice_lines` beschreibt ausschließlich den Datenbereich der Rechnungspositionen. `table.x` und `table.y` markieren die obere linke Ecke der ersten Datenzeile; die Editor-Spaltennamen werden nur als Overlay knapp darüber gezeichnet und nicht exportiert.

Im Modus `fixed` ist `rowHeightMm` ein Raster-Slot. Benötigt eine Position mehr Höhe, belegt sie 2, 3 oder mehr Slots; die nächste Position beginnt exakt an der nächsten Slot-Grenze. Dieser Modus ist für Vorlagen gedacht, deren horizontale Tabellenlinien bereits im Hintergrundbild liegen.

Im Modus `dynamic` verwendet die Engine die tatsächlich gemessene Texthöhe und mindestens `minRowHeightMm`. Es gibt keine Rasteraufrundung; Hilfslinien liegen an den berechneten Row-Grenzen.

Die Textmessung berücksichtigt Text, Spaltenbreite, Schriftfamilie, Schriftgröße, Schriftschnitt, `wrap`, `lineHeight` sowie horizontalen und vertikalen Zellinnenabstand. Alle fachlichen Ergebnisse bleiben in Millimetern; Zoom verändert nur das Rendering.

Bei aktivierten Testdaten zeigt das Eigenschaftenpanel eine Pagination-Vorschau mit Gesamtpositionen, passenden Positionen, Überlauf, verwendeter Höhe und Resthöhe. Überlaufpositionen werden nicht außerhalb der Tabelle gezeichnet. Ist eine einzelne Position höher als der verfügbare Tabellenbereich, wird sie als oversized gemeldet.

## Seitentemplates

Die Template-Tabs wechseln zwischen `single`, `first`, `middle` und `last`. Beim Wechsel werden Hintergrund, Elementliste, Canvas und Eigenschaftenpanel auf das aktive Template umgestellt; die Auswahl wird zurückgesetzt. Jedes Template merkt sich seine Editoransicht mit Zoom und Kamera separat. Template-Wechsel selbst erzeugen keinen Undo/Redo-Schritt.

Hintergrundbilder werden weiterhin nur lokal im Browser verwendet. Im JSON steht pro Template nur der Dateiname; nach einem Import muss die Bilddatei bei Bedarf erneut ausgewählt werden.

Copy/Paste funktioniert zwischen Templates. Core-Elemente behalten ihre Core-ID beim Einfügen, werden aber nur gegen das aktive Zieltemplate auf Duplikate geprüft. Dadurch kann `invoice_ref` oder `invoice_lines` auf mehreren Templates existieren, aber nicht zweimal im selben Template.

## Pagination

`paginateInvoiceRows(project, rows)` prüft zuerst `single.invoice_lines`. Passen alle Positionen auf das Single-Template, entsteht genau eine Seite. Reicht `single` nicht aus oder ist es nicht eingerichtet, verwendet die Engine `first`, prüft danach bevorzugt `last` und fügt nur dann `middle`-Seiten ein, wenn die verbleibenden Positionen noch nicht vollständig auf `last` passen.

Die Pagination berechnet keine Row-Höhen selbst. Sie ruft ausschließlich `layoutTableRows()` mit der jeweiligen `invoice_lines`-Geometrie des Templates auf. Unterschiedliche Tabellenhöhen und `fixed`/`dynamic` pro Template werden dadurch automatisch berücksichtigt.

Fehlen notwendige Templates oder kann eine Row nicht passen, liefert die Pagination ein strukturiertes Fehlerresultat statt in eine Endlosschleife zu laufen. Das Editorpanel zeigt eine kompakte Preview mit Testpositionsanzahl, Seitenzahl und Positionen pro Template-Seite.

## JSON-Format

Persistente `x`, `y`, `width` und `height` werden immer in Millimetern gespeichert. Die JSON enthält nur den Dateinamen des Hintergrunds, nicht das Bild selbst. Das Bild muss nach einem Import erneut ausgewählt werden.

Jedes Element besitzt eine interne `uid` für Auswahl und DOM-Zuordnung sowie eine semantische `id` für spätere Mappings. `elementClass` ist entweder `custom` oder `core`. Core-IDs (`invoice_ref`, `invoice_date`, `invoice_lines`) sind fest und nicht editierbar; Legacy-Elemente ohne `uid` oder `elementClass` werden beim Import automatisch ergänzt.

Schema Version 4 speichert `templates.single`, `templates.first`, `templates.middle` und `templates.last`. Jedes Template enthält `page` und `elements`. Version-1-, Version-2- und Version-3-Projekte werden beim Import in `templates.single` übernommen; die anderen Templates werden leer angelegt. Nicht exportiert werden Selection, History, Clipboard, Session-Bilddaten, Testdatenanzeige, Layoutresultate, gemessene Textgrößen oder Preview-Werte.

## Shortcuts

| Shortcut | Aktion |
| --- | --- |
| Delete / Entf | Auswahl löschen |
| Ctrl + A | Alle Elemente auswählen |
| Ctrl + C / V | Kopieren / Einfügen |
| Ctrl + X | Ausschneiden |
| Ctrl + D | Duplizieren |
| Ctrl + Z | Rückgängig |
| Ctrl + Y / Ctrl + Shift + Z | Wiederholen |
| Escape | Placement abbrechen / Auswahl aufheben |
| Pfeiltasten | 0,1 mm bewegen |
| Shift + Pfeiltasten | 1 mm bewegen |

## Datenschutz

Die Verarbeitung findet vollständig lokal im Browser statt. Es werden keine Daten übertragen und keine externen Dienste benötigt.

## Roadmap

1. Phase 1: Visual Mapper
2. Phase 2: Tabelleneditor
3. Phase 3: Dolibarr Field Mapping
4. Phase 4: Multi-Page Templates
5. Phase 5: Dolibarr PDF Module
6. Phase 6: Preview/Test-PDF
