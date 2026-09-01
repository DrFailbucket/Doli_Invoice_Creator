import { PAGE_WIDTH_MM, PAGE_HEIGHT_MM } from "./state.js";

export function mmToPx(valueMm, displayedPageWidthPx, displayedPageHeightPx, axis = "x") {
  return valueMm / (axis === "x" ? PAGE_WIDTH_MM : PAGE_HEIGHT_MM) * (axis === "x" ? displayedPageWidthPx : displayedPageHeightPx);
}

export function pxToMm(valuePx, displayedPageWidthPx, displayedPageHeightPx, axis = "x") {
  return valuePx / (axis === "x" ? displayedPageWidthPx : displayedPageHeightPx) * (axis === "x" ? PAGE_WIDTH_MM : PAGE_HEIGHT_MM);
}

export function eventToPageMm(event, pageElement) {
  const rect = pageElement.getBoundingClientRect();
  return { x: pxToMm(event.clientX - rect.left, rect.width, rect.height, "x"), y: pxToMm(event.clientY - rect.top, rect.width, rect.height, "y") };
}

export function displayedPageSize(pageElement) {
  const rect = pageElement.getBoundingClientRect();
  return { widthPx: rect.width, heightPx: rect.height };
}
