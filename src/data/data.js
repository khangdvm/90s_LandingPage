import { image, external, target } from "../../shared/content.js";
import { API_URL } from "../api/config.js";
export const viewNames = { valley: "View thung lũng", town: "View thị trấn" };
export const NEWS_PAGE_SIZE = 6;
export function assetUrl(path) {
  if (!path || !image(path) || path.startsWith("PLACEHOLDER_")) return "";
  if (external(path)) return path;
  if (path.startsWith("/uploads/")) return API_URL + path;
  return `${import.meta.env?.BASE_URL || "/"}${path.replace(/^\//, "")}`;
}
export function externalUrl(value) {
  return external(value) ? new URL(value).href : "";
}
export function contentTarget(value) {
  return value &&
    value !== "#" &&
    target(value) &&
    !value.startsWith("PLACEHOLDER_")
    ? value.startsWith("/")
      ? `${(import.meta.env?.BASE_URL || "/").replace(/\/$/, "")}${value}`
      : externalUrl(value) || value
    : "";
}
export const money = (amount) =>
  new Intl.NumberFormat("vi-VN").format(amount) + "đ";
export const dateStr = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const today = () => dateStr(new Date());
export function nextDay(value) {
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? value + "T12:00:00" : value,
  );
  date.setDate(date.getDate() + 1);
  return dateStr(date);
}
export const displayDate = (value) =>
  new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? value + "T12:00:00" : value,
  ).toLocaleDateString("vi-VN");
