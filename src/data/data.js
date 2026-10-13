export const viewNames = { valley: "View thung lũng", town: "View thị trấn" };
export const NEWS_PAGE_SIZE = 6;
export function assetUrl(path) {
  if (typeof path !== "string" || !path) return "";
  const external = externalUrl(path);
  if (external) return external;
  if (!/^\/?assets\/[a-zA-Z0-9_./-]+$/.test(path) || path.includes(".."))
    return "";
  return `${import.meta.env?.BASE_URL || "/"}${path.replace(/^\//, "")}`;
}
export function externalUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : "";
  } catch {
    return "";
  }
}
export function contentTarget(value) {
  return /^#[a-zA-Z0-9_-]+$/.test(value || "") ? value : externalUrl(value);
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
