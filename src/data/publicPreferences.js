import { today, nextDay } from "./data.js";
const key = "90s.public.stay";
function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(value + "T12:00:00Z");
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function readStayPreferences(candidate) {
  let raw = candidate;
  if (!raw) {
    try {
      raw = JSON.parse(sessionStorage.getItem(key));
    } catch {}
  }
  if (!raw || typeof raw !== "object") raw = {};
  const checkin =
    validDate(raw.checkin) && raw.checkin >= today() ? raw.checkin : today();
  const checkout =
    validDate(raw.checkout) && raw.checkout > checkin
      ? raw.checkout
      : nextDay(checkin);
  return {
    view: ["all", "valley", "town"].includes(raw.view) ? raw.view : "all",
    guests: [0, 2, 4, 6, 8].includes(raw.guests) ? raw.guests : 0,
    checkin,
    checkout,
    searched: raw.searched === true && raw.checkin === checkin,
  };
}
export function saveStayPreferences(value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Filters still work in memory when storage is unavailable. */
  }
}
