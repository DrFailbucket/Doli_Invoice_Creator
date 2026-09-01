export function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
export function snap(value, gridMm) { return Math.round(value / gridMm) * gridMm; }
export function downloadJson(fileName, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = fileName; link.click(); URL.revokeObjectURL(url);
}
export function readFileAsText(file) { return file.text(); }
export function readFileAsDataUrl(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); }); }
