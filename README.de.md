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
- Editor für die Rechnungstabelle mit Spaltenbreiten, Ausrichtung, Umbruch und Zeilenlayout-Vorschau
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
- Mehrseiten-Templates sind noch nicht produktionsreif.

## Funktionsweise

Der Creator definiert, wo Inhalte erscheinen: Templates, Hintergründe, Felder, Positionen, Größen, Formatierungen und Tabellengrößen. Ein separates Dolibarr-PDF-Renderer-Modul entscheidet, welche Laufzeitdaten angezeigt werden, und erzeugt das eigentliche PDF.

Einseitige Templates sind derzeit funktionsfähig. Mehrseiten-Templates sind der nächste größere Entwicklungsschritt des Creators.

## Aktueller Stand

Der einseitige Editor, der Feldmapping-Workflow, die Rechnungstabelle, JSON-Import/-Export und der lokale Recovery-Workflow sind verfügbar. Vorhandene Template-Strukturen für weitere Seiten sind als Vorschau bzw. Entwicklungsunterstützung zu verstehen, nicht als fertiger Mehrseiten-Workflow.

## Autosave und Recovery

Wenn aktiviert, speichert das Autosave das aktuelle Projekt nach einer kurzen Verzögerung im lokalen Browserspeicher. Beim Start wird ein vorhandenes Autosave ausdrücklich zur Wiederherstellung oder zum Verwerfen angeboten. Es gibt keinen Cloud- oder Backend-Speicher.

Binäre Daten von Hintergrundbildern werden absichtlich nicht im Autosave gespeichert. Nach einer Wiederherstellung bleiben Layout und platzierte Elemente erhalten; das lokale Hintergrundbild muss bei Bedarf erneut ausgewählt werden.

## Hintergrundbilder

Hintergrundbilder werden vom lokalen Computer geladen. Im exportierten JSON werden nur Dateiname bzw. Referenz-Metadaten gespeichert, nicht die Bilddaten selbst. Nach Import oder Recovery muss das lokale Bild bei Bedarf erneut ausgewählt werden.

## Lokale Nutzung

Im Projektordner einen statischen Server starten:

```text
python -m http.server 8001
```

Danach [http://127.0.0.1:8001/](http://127.0.0.1:8001/) in einem modernen Browser öffnen.

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
- [ ] Workflow für Mehrseiten-Templates
- [ ] Weitere Dokumenttyp-Workflows
- [ ] Weitere UX- und Editor-Verbesserungen
