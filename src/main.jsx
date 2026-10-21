import { lazy, StrictMode, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DetailPage, { NotFound } from "./components/DetailPage.jsx";
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
const router = createBrowserRouter(
  [
    {
      path: "/admin/*",
      element: (
        <Suspense fallback={<p role="status">Đang tải trang quản trị…</p>}>
          <AdminRoutes />
        </Suspense>
      ),
    },
    { path: "/", element: <PublicSite /> },
    { path: "/phong/:slug", element: <DetailPage kind="room" /> },
    { path: "/tin-tuc/:slug", element: <DetailPage kind="news" /> },
    { path: "*", element: <NotFound /> },
  ],
  { basename: base.startsWith("/") ? base : "/" },
);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
