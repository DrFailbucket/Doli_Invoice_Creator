# Doli Invoice Creator

## Projektzweck

Doli Invoice Creator ist ein rein browserbasierter grafischer Template-Editor fuer Dolibarr-Dokumentvorlagen.

Der Creator definiert ausschliesslich:

- Seitenvorlagen
- Background-Bilder
- Platzhalter/Felder
- Positionen und Groessen
- Textformatierung
- Tabellengeometrie
- JSON-Template-Daten

Der Creator erzeugt selbst KEINE echten Dolibarr-Dokumente.

## Technik

- HTML5
- CSS
- Vanilla JavaScript ES Modules
- kein Backend
- keine Cloudpflicht
- keine Telemetrie
- kein Framework erforderlich
- mm sind die fachliche Geometrie-Single-Source-of-Truth
- Browserpixel dienen nur Darstellung/Messung
- Open-Source-/GitHub-Pages-tauglich

## Roadmap

Diese Roadmap ist die Single Source of Truth fuer zukuenftige Coding-Agents.

### PHASE 1 - Editor Foundation ✅

- A4 workspace in mm
- PNG backgrounds
- zoom / camera / fit
- middle-mouse pan
- grid / snap
- text + core elements
- placement / move / resize
- multi-selection
- align / distribute / spacing
- copy / cut / paste / duplicate
- undo / redo
- properties panel
- element list
- JSON import/export
- toast/status system

### PHASE 2 - Position Table + Row Layout ✅

#### 2.1 Table Editor ✅

- `invoice_lines`
- 6 line columns
- column widths / separators
- table resize
- test rows
- fixed-grid foundation

#### 2.2 Row Layout ✅

- fixed rows
- dynamic rows
- browser text measurement
- wrap
- padding
- vertical align
- overflow detection
- oversized detection
- layout preview
- zoom-independent mm calculations

### PHASE 3 - Page Templates ✅

- exactly 4 template definitions:
  - `single` = Einseitig
  - `first` = Mehrseitig Anfang
  - `middle` = Mehrseitig Mitte
  - `last` = Mehrseitig Ende
- own background per template
- own elements per template
- core IDs template-local
- copy/paste across templates
- camera/zoom per template
- editor pagination only as layout simulation

Important:

- Creator defines `middle` exactly once
- runtime Dolibarr module decides whether/how often `middle` is reused
- Creator does NOT create runtime page counts

### PHASE 4 - Document Types + Field Registry ✅

#### 4.1 Document Type Model ✅

- `projectState.documentType`
- default `invoice`
- migration for older projects
- import/export persistence
- supported values:
  - `invoice`
  - `proposal`
  - `order`
  - `shipment`

#### 4.2 Field Registry Foundation ✅

- `js/fieldRegistry.js`
- metadata:
  - `id`
  - `label`
  - `category`
  - `documentTypes`
  - `source`
  - `recommended`
- helpers:
  - `getFieldById(id)`
  - `getFieldsForDocumentType(type)`
  - `getFieldsByCategory(category)`
- registry immutable/read-only
- current architecture examples:
  - `object_ref`
  - `object_date`
  - `invoice_lines`
  - `page_current`
  - `page_count`

#### 4.3 Dolibarr Placeholder Catalog ✅

- integrate official Dolibarr placeholders/tags
- prefer official Dolibarr IDs/names
- categorize fields
- no runtime binding

#### 4.4 Document-Type Assignment ✅

- assign fields to document types
- initial target types:
  - invoice
  - proposal
  - order
  - shipment/delivery
- shared fields MAY belong to multiple types

#### 4.5 Recommended Base Elements ✅

- define small recommended set per document type
- design completeness only
- no legal/tax compliance claims

#### 4.6 Field Library UI ✅

- left-side field library
- categories
- Dolibarr fields
- system/renderer fields
- custom/free fields

#### 4.7 Search + Filtering ✅

- relevant for current document type
- all fields
- text search

#### 4.8 New Project Document-Type Selection ✅

- ask type when creating a new project
- document type belongs to project, not app settings

#### 4.9 Change Document Type ✅

- allow later change
- existing placed elements remain
- filter/recommendations update
- never auto-delete fields

### PHASE 5 - Local Projects + Persistence ⬜

#### 5.1 Settings

- grid
- snap
- editor preferences
- recovery preferences

#### 5.2 First-Run Setup

- global editor settings only
- NOT document-type selection

#### 5.3 IndexedDB

- local browser project storage

#### 5.4 Autosave

- save after changes

#### 5.5 Crash Recovery

- recovery snapshots
- restoration after tab/browser failure
- rolling checkpoints

#### 5.6 Local Background Storage

- store PNG/background blobs locally

#### 5.7 Project Management

- new
- open
- rename
- duplicate
- delete

### PHASE 6 - Preview + Template Validation ⬜

#### 6.1 Central Test Data

- complete example document data structure

#### 6.2 Field Test Values

- realistic preview values for placeholders

#### 6.3 Table Test Data

- integrate existing row preview

#### 6.4 Template Completeness

- check recommended design elements only

#### 6.5 User-Friendly Messages

- clear wording
- missing fields listed explicitly
- reusable `?` help/tooltips
- avoid architecture jargon

### PHASE 7 - UI/UX Polish ⬜

#### 7.1 Page Mode

- `Einseitig | Mehrseitig`

#### 7.2 Multi-Page Subtabs

- `Anfang | Mitte | Ende`

#### 7.3 Left Sidebar

- organize field library / element list / filters

#### 7.4 Properties Panel

- improve structure/labels

#### 7.5 Template/Project Status

- clear unobtrusive status indicators

#### 7.6 Help System

- reusable tooltip/help pattern

#### 7.7 Responsive Behavior

- support different desktop resolutions

### PHASE 8 - Template Schema + Export ⬜

#### 8.1 Final JSON Schema

- stable renderer-facing format

#### 8.2 Schema Versioning

- future migrations

#### 8.3 Export Validation

- technical requirements only

#### 8.4 Renderer Interface

- export only data needed by renderer

#### 8.5 Documentation

- schema docs
- field docs
- example templates
- developer docs

### PHASE 9 - Open-Source Release ⬜

- final README
- license
- example projects
- regression tests
- GitHub repository
- GitHub Pages
- local-only/privacy documentation
- release 1.0

### PHASE 10 - Dolibarr Module / Renderer ⬜

SEPARATE PROJECT; NOT CREATOR CODE.

Runtime module responsibilities:

- load template JSON
- read Dolibarr data
- bind field IDs to runtime values
- choose single vs multi-page
- distribute invoice/order/etc. lines
- reuse `middle` 0..N times
- calculate current/total pages
- provide `page_current` / `page_count`
- provide totals/tax/runtime values
- combine backgrounds + mappings + data
- generate PDF
- Dolibarr/ModuleBuilder integration

## Hard Architecture Boundary

Creator = WHERE + HOW content is displayed.

Creator MAY:

- define templates
- place fields
- style fields
- define table geometry
- preview/test layouts
- export mapping JSON

Creator MUST_NOT:

- perform real Dolibarr runtime data binding
- calculate business totals/tax
- decide real document page count
- create repeated runtime middle pages
- generate final Dolibarr PDFs
- contain ModuleBuilder runtime logic

Dolibarr Module = WHAT data is displayed + HOW MANY runtime pages exist.

## Field Rules

- prefer official Dolibarr placeholder IDs/tags where available
- avoid unnecessary second naming layer
- system/renderer-only placeholders MAY exist, e.g.:
  - `page_current`
  - `page_count`
- these remain graphical placeholders inside Creator
- `invoice_lines` is a repeat/layout container
- totals/page fields remain separate elements

## Document-Type Rules

- document type belongs to each project
- type controls field relevance/recommendations/validation
- switching type MUST NOT delete placed elements
- first-run editor setup and project document-type selection are separate concepts

## Agent Work Rules

- read AGENTS.md before work
- one prompt = one small scoped task
- use smallest reasonable diff
- inspect only relevant files first
- preserve existing architecture
- no speculative refactors
- no unrelated cleanup
- no new dependency unless necessary
- no future roadmap work unless requested
- test changed scope
- distinguish executed tests from untested assumptions
- no automatic commits
- visible dev server in normal VS Code terminal when needed
- REPORT concise result
- STOP when task is complete
