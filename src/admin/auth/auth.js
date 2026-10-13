const STORAGE_KEY = "90s.cms.session";
const CHANGE_EVENT = "90s:cms-session-change";
let message = "";

// This only checks shape/expiry for navigation. The API verifies JWT signatures.
export function tokenExpiry(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts.every(Boolean)) return 0;
    const decode = (value) =>
      JSON.parse(atob(value.replace(/-/g, "+").replace(/_/g, "/")));
    const claims = decode(parts[1]);
    if (
      decode(parts[0]).alg !== "HS256" ||
      claims.iss !== "90s-cms" ||
      claims.aud !== "90s-admin" ||
      typeof claims.sub !== "string" ||
      !Number.isFinite(claims.exp)
    )
      return 0;
    return claims.exp * 1000;
  } catch {
    return 0;
  }
}
export function getToken() {
  try {
    const token = sessionStorage.getItem(STORAGE_KEY);
    return token && tokenExpiry(token) > Date.now() ? token : null;
  } catch {
    return null;
  }
}
export function saveSession(token) {
  if (typeof token !== "string" || tokenExpiry(token) <= Date.now())
    throw new Error("Máy chủ trả về phiên đăng nhập không hợp lệ.");
  try {
    sessionStorage.setItem(STORAGE_KEY, token);
  } catch {
    throw new Error(
      "Trình duyệt không cho phép lưu phiên. Vui lòng bật sessionStorage để đăng nhập.",
    );
  }
  message = "";
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
export function clearSession(reason = "") {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Storage may be unavailable. */
  }
  message = reason;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
export const sessionMessage = () => message;
export function subscribeSession(callback) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
