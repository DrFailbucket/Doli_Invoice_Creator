const measureCanvas = document.createElement("canvas");
const context = measureCanvas.getContext("2d");

function cssFontFamily(fontFamily) {
  return String(fontFamily).includes(" ") ? `"${String(fontFamily).replaceAll('"', '\\"')}"` : fontFamily;
}

export function measureTextBlock({ text = "", widthMm, fontFamily = "Arial", fontSizePt = 9, fontWeight = "normal", wrap = true, lineHeight = 1.2, paddingHorizontalMm = 0, paddingVerticalMm = 0, mmToPx = 3.7795275591 }) {
  const availableWidthMm = Math.max(0.1, widthMm - paddingHorizontalMm * 2);
  const availableWidthPx = availableWidthMm * mmToPx;
  const fontPx = fontSizePt * 96 / 72;
  context.font = `${fontWeight} ${fontPx}px ${cssFontFamily(fontFamily)}`;
  const source = String(text ?? "");
  const paragraphs = source.split(/\r?\n/);
  let lineCount = 0;
  let maxWidthPx = 0;
  paragraphs.forEach((paragraph) => {
    if (!wrap) { lineCount += 1; maxWidthPx = Math.max(maxWidthPx, context.measureText(paragraph).width); return; }
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) { lineCount += 1; return; }
    let line = "";
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (line && context.measureText(candidate).width > availableWidthPx) { lineCount += 1; maxWidthPx = Math.max(maxWidthPx, context.measureText(line).width); line = word; } else line = candidate;
    });
    lineCount += 1; maxWidthPx = Math.max(maxWidthPx, context.measureText(line).width);
  });
  const lineHeightPx = fontPx * lineHeight;
  const contentHeightMm = lineCount * lineHeightPx / mmToPx;
  const horizontalOverflow = !wrap && maxWidthPx > availableWidthPx;
  return { widthMm: maxWidthPx / mmToPx, heightMm: contentHeightMm + paddingVerticalMm * 2, contentHeightMm, lineCount, horizontalOverflow, overflow: horizontalOverflow };
}
