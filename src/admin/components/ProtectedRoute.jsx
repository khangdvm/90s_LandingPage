import { useEffect, useSyncExternalStore } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  clearSession,
  getToken,
  sessionMessage,
  subscribeSession,
  tokenExpiry,
} from "../auth/auth.js";
export function useSessionToken() {
  return useSyncExternalStore(subscribeSession, getToken, () => null);
}
export default function ProtectedRoute() {
  const token = useSessionToken();
  const location = useLocation();
  useEffect(() => {
    if (!token) return;
    const timer = setTimeout(
      () => clearSession("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."),
      Math.min(tokenExpiry(token) - Date.now(), 2147483647),
    );
    return () => clearTimeout(timer);
  }, [token]);
  return token ? (
    <Outlet />
  ) : (
    <Navigate
      to="/admin/login"
      replace
      state={{
        from: location.pathname + location.search,
        reason: sessionMessage(),
      }}
    />
  );
}
