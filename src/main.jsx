import { lazy, StrictMode, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import "./styles/styles.css";
const AdminRoutes = lazy(() => import("./admin/AdminRoutes.jsx"));
const base = import.meta.env.BASE_URL;
function PublicSite() {
  useEffect(() => {
    document.title = "90s Homestay — Hẹn nhau ở Tam Đảo";
  }, []);
  return <App />;
}
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={base.startsWith("/") ? base : "/"}>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<p role="status">Đang tải trang quản trị…</p>}>
              <AdminRoutes />
            </Suspense>
          }
        />
        <Route path="*" element={<PublicSite />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
