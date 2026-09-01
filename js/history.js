const undoStack = [];
const redoStack = [];
const LIMIT = 100;

function documentSnapshot(state) {
  return JSON.stringify({
    version: state.version,
    documentType: state.documentType,
    templates: state.templates,
    editor: {
      gridMm: state.editor.gridMm,
      snapToGrid: state.editor.snapToGrid,
      gridVisible: state.editor.gridVisible,
      templateViews: state.editor.templateViews,
      paginationRowCount: state.editor.paginationRowCount
    }
  });
}

export function capture(state) { return documentSnapshot(state); }
export function record(before, state) { const after = documentSnapshot(state); if (before === after) return; undoStack.push({ before, after }); if (undoStack.length > LIMIT) undoStack.shift(); redoStack.length = 0; }
export function canUndo() { return undoStack.length > 0; }
export function canRedo() { return redoStack.length > 0; }
export function undo(state, restore) { const item = undoStack.pop(); if (!item) return false; redoStack.push(item); restore(JSON.parse(item.before)); return true; }
export function redo(state, restore) { const item = redoStack.pop(); if (!item) return false; undoStack.push(item); restore(JSON.parse(item.after)); return true; }
export function clear() { undoStack.length = 0; redoStack.length = 0; }
