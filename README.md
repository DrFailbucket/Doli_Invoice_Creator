# Doli Invoice Creator

[English](README.md) | [Deutsch](README.de.md)

Browser-based visual template editor for Dolibarr document layout mappings. Doli Invoice Creator runs locally in the browser and needs no backend for template design.

The Creator does not generate invoices or PDFs. It creates layout definitions and JSON templates that can be consumed by a compatible Dolibarr PDF renderer or module.

## Try it

# [Open the Editor](https://drfailbucket.github.io/Doli_Invoice_Creator/)

## What it does

Design A4 document layouts visually, place Dolibarr fields, configure an invoice line table, and export the resulting template as JSON. The editor is designed to support document types such as invoices, proposals, orders, and shipments without binding live Dolibarr data.

## Features

- Visual A4 editor with millimetre-based geometry
- Local background images
- Dolibarr field library with core fields, custom fields, aliases, and generic extrafield patterns
- Field search, document-type scope, recommendations, and contextual labels
- Invoice line table editor with column sizing, alignment, wrapping, and row layout preview
- Independent single-page and multi-page layout templates: `single`, `first`, `middle`, and `last`
- Font family, size, weight, text color, alignment, and multiline text
- Grid, snapping, zoom, and canvas navigation/panning
- Multi-selection, alignment, distribution, and spacing tools
- Copy, paste, cut, duplicate, undo, and redo
- JSON import and export
- Resizable left-sidebar panels
- Optional local browser autosave and recovery

## What it does not do

- It does not create invoices or PDFs itself.
- It does not connect to live Dolibarr data.
- It does not provide a backend, account system, or cloud project store.
- It does not calculate runtime pagination or decide how many pages a real document needs.

## How it works

The Creator defines where content appears: templates, backgrounds, fields, positions, sizes, styles, and table geometry. A separate Dolibarr PDF renderer decides which runtime data is displayed and produces the actual PDF.

The Creator supports independent single-page and multi-page layouts. Multi-page projects use separate first, middle, and last page templates. The middle template acts as a reusable layout for any number of intermediate pages. Actual runtime pagination is handled by the PDF renderer, which decides whether to use `single` or `first` + `middle` 0..N times + `last` and produces the actual PDF.

## Current status

The single-page and multi-page layout workflows, field mapping, invoice line table, JSON import/export, and local recovery workflow are available. Runtime page distribution remains the responsibility of the PDF renderer.

## Autosave and recovery

When enabled, autosave stores the current project in local browser storage after a short debounce. On startup, an available autosave is offered for explicit recovery or discard. No cloud or backend storage is involved.

Background image binary data is intentionally not stored by autosave. After recovery, the layout and placed elements remain intact, but the local background image may need to be selected again.

## Background images

Background images are loaded from the local computer. Exported project JSON stores the background filename/reference metadata, not the image binary. After importing or recovering a project, select the local image again when necessary.

## Local usage

From the project directory, start a static server:

```text
python -m http.server 8001
```

Then open [http://127.0.0.1:8001/](http://127.0.0.1:8001/) in a modern browser.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| Delete / Entf | Delete selected elements |
| Ctrl + A | Select all elements |
| Ctrl + C / V | Copy / paste |
| Ctrl + X | Cut |
| Ctrl + D | Duplicate |
| Ctrl + Z | Undo |
| Ctrl + Y / Ctrl + Shift + Z | Redo |
| Escape | Cancel placement / clear selection |
| Arrow keys | Move by 0.1 mm |
| Shift + Arrow keys | Move by 1 mm |

## Project format

Projects use JSON schema version 4. Layout geometry is stored in millimetres. Semantic field IDs are preserved for renderer mappings, while each visual element has its own internal `uid`. Background image files are not embedded in the JSON.

## Privacy

The editor is client-side and requires no account or backend. Projects are not uploaded by the editor, there is no telemetry, and local operation has no cloud dependency.

## Roadmap

- [x] Visual single-page template editor
- [x] Dolibarr field registry and field library
- [x] Invoice line table editor
- [x] JSON import/export
- [x] Local autosave and recovery
- [x] Multi-page template workflow
- [ ] Additional document-type workflows
- [ ] Further UX and editor improvements
